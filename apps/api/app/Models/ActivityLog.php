<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * ActivityLog — append-only audit trail entry.
 *
 * Ditulis oleh ActivityLogger observer. Read-only dari sisi app —
 * tidak ada endpoint untuk edit/hapus (ideally), hanya insert + list.
 */
class ActivityLog extends Model
{
    protected $fillable = [
        'action',
        'subject_type',
        'subject_id',
        'subject_label',
        'changes',
        'actor',
        'created_at',
    ];

    protected $casts = [
        'changes' => 'array',
        'created_at' => 'datetime',
    ];

    // Append-only — disable updated_at
    public $timestamps = false;

    public function getUpdatedAtColumn()
    {
        return null;
    }
}
