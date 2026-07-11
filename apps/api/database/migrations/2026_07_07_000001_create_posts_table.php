<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel posts — blog/notes CMS untuk halaman publik /blog.
        // Polanya mirip products: status enum, soft visibility via status + published_at,
        // auto-slug di model layer (bukan di DB trigger).
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->string('slug', 220)->unique();
            $table->string('excerpt', 500)->nullable();  // untuk card list + meta description
            $table->longText('content');                  // HTML dari Tiptap editor
            $table->string('thumbnail', 500)->nullable(); // path di EnStorage (e.g. "enstorage/posts/thumbnails/...")
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
