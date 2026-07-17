<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

/**
 * MaintenanceController — toggle site-wide maintenance mode.
 *
 * Pakai Laravel's built-in maintenance driver (config/app.php:133).
 * - enable: Artisan::call('down', [...]) → tulis maintenance flag ke storage
 * - disable: Artisan::call('up')
 *
 * Banner message disimpan di SiteSetting (key=maintenance_message) supaya
 * admin bisa edit tanpa restart. Public storefront consumer site_settings
 * ada di fase berikutnya.
 *
 * Activity log entry ditulis manual di sini (bukan via observer) karena
 * action ini tidak masuk model::save() cycle biasa.
 */
class MaintenanceController extends Controller
{
    /**
     * GET /api/admin/maintenance/status
     */
    public function status(): JsonResponse
    {
        $enabled = (bool) app()->isDownForMaintenance();
        $message = SiteSetting::where('key', 'maintenance_message')->value('value')
            ?? 'Sedang dalam perbaikan. Coba lagi sebentar lagi ya.';

        return response()->json([
            'data' => [
                'enabled' => $enabled,
                'message' => $message,
            ],
        ]);
    }

    /**
     * POST /api/admin/maintenance/toggle
     * Body: { enabled: bool, message?: string }
     */
    public function toggle(Request $request): JsonResponse
    {
        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
            'message' => ['nullable', 'string', 'max:500'],
        ]);

        // Update banner message kalau dikirim
        if (array_key_exists('message', $data) && $data['message'] !== null) {
            SiteSetting::updateOrCreate(
                ['key' => 'maintenance_message'],
                ['value' => $data['message'], 'type' => 'string'],
            );
        }

        if ($data['enabled']) {
            // Enable: artisan down dengan bypass secret supaya admin masih
            // bisa akses via cookie. Refresh secret tiap enable untuk
            // invalidate previous bypass sessions.
            Artisan::call('down', [
                '--render' => 'errors::503',
                '--secret' => 'bypass-'.bin2hex(random_bytes(8)),
                '--retry' => 60,
            ]);
        } else {
            Artisan::call('up');
        }

        // Log activity
        ActivityLog::create([
            'action' => 'maintenance_toggled',
            'subject_type' => 'maintenance',
            'subject_id' => null,
            'subject_label' => $data['enabled'] ? 'Maintenance Mode ON' : 'Maintenance Mode OFF',
            'changes' => ['enabled' => $data['enabled'], 'message' => $data['message'] ?? null],
            'actor' => 'admin',
            'created_at' => now(),
        ]);

        return response()->json([
            'data' => [
                'enabled' => $data['enabled'],
                'message' => SiteSetting::where('key', 'maintenance_message')->value('value'),
            ],
            'message' => $data['enabled']
                ? 'Maintenance mode diaktifkan. Pengunjung akan melihat halaman 503.'
                : 'Maintenance mode dinonaktifkan. Toko kembali normal.',
        ]);
    }
}
