<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Kolom category — label editorial ringan untuk post (Design, DevLog,
        // Research, Process, Notes). Bedanya dengan Category model: kategori post
        // bebas-teks (bukan relasi FK) karena jurnal tidak butuh taksonomi ketat.
        Schema::table('posts', function (Blueprint $table) {
            $table->string('category', 100)->nullable()->after('excerpt');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex(['category']);
            $table->dropColumn('category');
        });
    }
};
