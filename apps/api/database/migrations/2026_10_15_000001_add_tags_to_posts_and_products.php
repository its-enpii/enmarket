<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Multi-tags editorial (array JSON string). Dipakai untuk filter publik
        // ?tag= di posts & products. Nullable — konten lama tetap valid.
        Schema::table('posts', function (Blueprint $table) {
            $table->json('tags')->nullable()->after('category');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->json('tags')->nullable()->after('fitur');
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('tags');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('tags');
        });
    }
};
