<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('password')->nullable();
            $table->string('phone')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('phone_verified_at')->nullable();
            $table->boolean('is_admin')->default(false);
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->index('phone');
            $table->index('is_admin');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
