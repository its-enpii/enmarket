<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_otps', function (Blueprint $table) {
            $table->id();
            $table->string('phone')->index();
            $table->string('code_hash');
            $table->timestamp('expires_at');
            $table->unsignedInteger('attempts')->default(0);
            $table->timestamp('verified_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['phone', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_otps');
    }
};
