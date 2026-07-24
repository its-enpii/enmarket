<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('kode_order')->unique(); // EPS-20240701-A3KX
            $table->string('nama_pembeli');
            $table->string('email_pembeli');
            $table->string('wa_pembeli');
            $table->decimal('total_harga', 10, 2);
            if (app()->runningUnitTests() || \Illuminate\Support\Facades\DB::getDriverName() === 'sqlite') {
                $table->string('status')->default('pending');
            } else {
                $table->enum('status', ['pending', 'paid', 'failed', 'expired', 'refunded'])->default('pending');
            }
            $table->string('tripay_reference')->nullable();
            $table->text('qr_string')->nullable();
            $table->text('qr_url')->nullable();
            $table->timestamp('qr_expired_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('email_pembeli');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
