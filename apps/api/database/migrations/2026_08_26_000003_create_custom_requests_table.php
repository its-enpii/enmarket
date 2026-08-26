<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_requests', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('email');
            $table->string('wa', 20);
            if (app()->runningUnitTests() || \Illuminate\Support\Facades\DB::getDriverName() === 'sqlite') {
                $table->string('jenis_proyek');
                $table->string('budget_range');
                $table->string('timeline');
                $table->string('status')->default('baru');
            } else {
                $table->enum('jenis_proyek', ['website', 'mobile-app', 'webapp', 'automation', 'other']);
                $table->enum('budget_range', ['<5jt', '5-15jt', '15-50jt', '50jt+', 'discuss']);
                $table->enum('timeline', ['<2minggu', '2-4minggu', '1-3bulan', '3-6bulan', 'flexible']);
                $table->enum('status', ['baru', 'diproses', 'selesai', 'dibatalkan'])->default('baru');
            }
            $table->text('deskripsi');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_requests');
    }
};
