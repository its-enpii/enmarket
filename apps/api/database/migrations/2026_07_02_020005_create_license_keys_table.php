<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // license_keys dibuat sebelum order_deliveries karena order_deliveries FK ke sini
        Schema::create('license_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products');
            $table->string('key')->unique();
            $table->enum('status', ['aktif', 'digunakan', 'kadaluarsa', 'dicabut'])->default('aktif');
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('license_keys');
    }
};
