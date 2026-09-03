<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sponsor_bids', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('domain', 255);
            $table->decimal('bid_amount', 12, 2);
            $table->string('name', 100)->nullable();
            $table->string('description', 500)->nullable();
            $table->string('contact_name', 100)->nullable();
            $table->enum('status', ['pending', 'paid', 'expired', 'failed'])->default('pending')->index();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['domain', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsor_bids');
    }
};
