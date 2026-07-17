<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\LicenseKey;
use App\Models\Order;
use App\Models\Post;
use App\Models\Product;
use App\Models\SiteSetting;
use Illuminate\Database\Eloquent\Model;

/**
 * ActivityLogger — observer generik untuk audit trail.
 *
 * Reusable across all observed models. Read subject_type + label dari
 * model metadata map. Dirty diff di-skip timestamp columns.
 *
 * Subject type disimpan sebagai string lowercase singular ('product', 'post')
 * bukan class FQCN, supaya index ringan & decoupling dari rename class.
 *
 * Catatan: observer ini DIUMPAN ke model via Model::observe() di
 * AppServiceProvider::boot(). Kalau model di-observe tanpa register
 * observer di sini, audit trail tidak akan jalan.
 */
class ActivityLogger
{
    /**
     * Map model class → subject_type identifier.
     * Override per model kalau perlu.
     */
    private const SUBJECT_TYPE_MAP = [
        Product::class => 'product',
        Post::class => 'post',
        Order::class => 'order',
        LicenseKey::class => 'license_key',
        SiteSetting::class => 'setting',
    ];

    /**
     * Map model class → field name untuk human-readable label.
     */
    private const LABEL_FIELD_MAP = [
        Product::class => 'nama',
        Post::class => 'title',
        Order::class => 'kode_order',
        LicenseKey::class => 'license_key',
        SiteSetting::class => 'key',
    ];

    public function created(Model $model): void
    {
        $this->log($model, 'created', [
            'attributes' => $model->getAttributes(),
        ]);
    }

    public function updated(Model $model): void
    {
        // Skip kalau tidak ada dirty changes (e.g. touch tanpa diff)
        if (! $model->wasChanged()) {
            return;
        }

        $changes = $model->getChanges();
        $original = $model->getOriginal();

        // Filter out timestamp columns dari diff
        unset($changes['updated_at'], $changes['created_at']);

        if (empty($changes)) {
            return;
        }

        $diff = [];
        foreach ($changes as $key => $newValue) {
            $diff[$key] = [
                'before' => $original[$key] ?? null,
                'after' => $newValue,
            ];
        }

        // Detect status flip sebagai special action (untuk badge UI)
        $action = isset($changes['status']) ? 'status_changed' : 'updated';

        $this->log($model, $action, ['changes' => $diff]);
    }

    public function deleted(Model $model): void
    {
        $this->log($model, 'deleted', [
            'attributes' => $model->getOriginal(),
        ]);
    }

    private function log(Model $model, string $action, array $payload): void
    {
        $class = $model::class;
        $subjectType = self::SUBJECT_TYPE_MAP[$class] ?? strtolower(class_basename($class));
        $labelField = self::LABEL_FIELD_MAP[$class] ?? null;
        $subjectLabel = $labelField ? ($model->{$labelField} ?? null) : null;

        ActivityLog::create([
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $model->getKey(),
            'subject_label' => $subjectLabel !== null ? (string) $subjectLabel : null,
            'changes' => $payload,
            'actor' => 'admin',
            'created_at' => now(),
        ]);
    }
}
