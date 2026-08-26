<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });

        Schema::table('wishlists', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->cascadeOnDelete();
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });

        Schema::table('wishlists', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
