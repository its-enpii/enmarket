<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pivot many-to-many antara products dan posts — supaya produk bisa link ke
 * blog post (panduan, warning, catatan teknis). 1 produk bisa punya banyak post,
 * 1 post bisa dipakai banyak produk.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_post', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('post_id')->constrained('posts')->cascadeOnDelete();
            // Urutan tampil di detail produk (0 = paling atas). Default 0.
            $table->unsignedTinyInteger('urutan')->default(0);
            $table->timestamps();

            $table->unique(['product_id', 'post_id']);
            $table->index(['product_id', 'urutan']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_post');
    }
};