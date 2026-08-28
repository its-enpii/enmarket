<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameItem extends Model
{
    protected $table = 'game_items';

    protected $fillable = [
        'game_id',
        'nama',
        'harga',
        'digiflazz_sku',
        'digiflazz_category',
        'sort_order',
        'active',
    ];

    protected $casts = [
        'harga' => 'decimal:2',
        'active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
