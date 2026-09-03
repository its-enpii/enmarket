<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'is_sponsor_bid')) {
                $table->boolean('is_sponsor_bid')->default(false)->after('is_topup_order');
            }

            if (! Schema::hasColumn('orders', 'sponsor_domain')) {
                $table->string('sponsor_domain', 255)->nullable()->after('is_sponsor_bid');
            }

            if (! Schema::hasColumn('orders', 'sponsor_amount')) {
                $table->decimal('sponsor_amount', 12, 2)->nullable()->after('sponsor_domain');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            foreach (['sponsor_amount', 'sponsor_domain', 'is_sponsor_bid'] as $column) {
                if (Schema::hasColumn('orders', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
