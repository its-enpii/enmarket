<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('nama');
            $table->string('slug')->unique();
            $table->text('deskripsi');
            $table->decimal('harga', 10, 2);
            if (app()->runningUnitTests() || \Illuminate\Support\Facades\DB::getDriverName() === 'sqlite') {
                $table->string('tipe');
            } else {
                $table->enum('tipe', ['download', 'license', 'bundle']);
            }
            $table->text('file_url')->nullable(); // path di EnStorage
            $table->integer('download_expiry_days')->default(7);
            $table->json('preview_images')->nullable(); // array URL gambar
            $table->json('fitur')->nullable(); // array fitur/isi produk
            if (app()->runningUnitTests() || \Illuminate\Support\Facades\DB::getDriverName() === 'sqlite') {
                $table->string('status')->default('draft');
            } else {
                $table->enum('status', ['aktif', 'draft', 'tidak_dijual'])->default('draft');
            }
            $table->timestamps();

            $table->index('status');
            $table->index('tipe');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
