<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            if (app()->runningUnitTests() || \Illuminate\Support\Facades\DB::getDriverName() === 'sqlite') {
                $table->string('type');
            } else {
                $table->enum('type', ['percent', 'fixed']);
            }
            $table->decimal('value', 10, 2);
            $table->decimal('min_order', 10, 2)->nullable();
            $table->integer('max_uses')->nullable();
            $table->integer('used_count')->default(0);
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index('active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
