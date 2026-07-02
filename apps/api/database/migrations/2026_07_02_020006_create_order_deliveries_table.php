<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained('order_items')->cascadeOnDelete();
            $table->string('download_token')->unique()->nullable();
            $table->text('download_url')->nullable(); // path file di EnStorage
            $table->timestamp('token_expired_at')->nullable();
            $table->foreignId('license_key_id')->nullable()->constrained('license_keys')->nullOnDelete();
            $table->timestamp('email_sent_at')->nullable();
            $table->timestamp('wa_sent_at')->nullable();
            $table->timestamps();

            $table->index('email_sent_at');
            $table->index('wa_sent_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_deliveries');
    }
};
