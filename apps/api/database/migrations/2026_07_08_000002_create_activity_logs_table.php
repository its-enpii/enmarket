<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel activity_logs — append-only audit trail.
     *
     * Ditulis oleh ActivityLogger observer setiap kali model Product/Post/
     * Order/LicenseKey/SiteSetting di create/update/delete. Backend pakai
     * untuk Recent Activity panel di dashboard admin.
     *
     * subject_type pakai string (bukan morph class) supaya index ringan &
     * decoupling dari class name. subject_id nullable karena beberapa action
     * (mis. setting toggled) tidak terikat ke row ID.
     *
     * TIDAK punya updated_at — append-only, tidak boleh di-edit.
     */
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action', 50); // 'created' | 'updated' | 'deleted' | 'maintenance_toggled'
            $table->string('subject_type', 100); // 'product' | 'post' | 'order' | 'license_key' | 'setting' | 'maintenance'
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('subject_label', 200)->nullable();
            $table->json('changes')->nullable(); // { before, after } atau metadata
            $table->string('actor', 100)->default('admin'); // single-user untuk sekarang
            $table->timestamp('created_at')->nullable();

            $table->index(['subject_type', 'subject_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
