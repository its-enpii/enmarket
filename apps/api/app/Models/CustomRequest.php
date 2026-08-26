<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomRequest extends Model
{
    use HasFactory;

    protected $table = 'custom_requests';

    protected $fillable = [
        'nama',
        'email',
        'wa',
        'jenis_proyek',
        'deskripsi',
        'budget_range',
        'timeline',
        'status',
        'notes',
    ];

    public function statusLabel(): string
    {
        return match ($this->status) {
            'baru' => 'Baru',
            'diproses' => 'Diproses',
            'selesai' => 'Selesai',
            'dibatalkan' => 'Dibatalkan',
            default => ucfirst($this->status),
        };
    }
}
