<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('email_pembeli')->nullable()->change();
            $table->string('wa_pembeli')->nullable()->change();

            $table->boolean('is_topup_order')->default(false)->after('paid_at');
            $table->foreignId('game_id')->nullable()->after('is_topup_order')
                ->constrained('games')->nullOnDelete();
            $table->foreignId('game_item_id')->nullable()->after('game_id')
                ->constrained('game_items')->nullOnDelete();
            $table->string('game_user_id', 64)->nullable()->after('game_item_id');
            $table->string('game_server_id', 64)->nullable()->after('game_user_id');
            $table->string('contact_type', 10)->nullable()->after('game_server_id');
            $table->string('contact_value', 120)->nullable()->after('contact_type');
            $table->string('topup_status', 20)->nullable()->after('contact_value');
            $table->string('digiflazz_trx_id', 64)->nullable()->after('topup_status');
            $table->json('digiflazz_response')->nullable()->after('digiflazz_trx_id');

            if (!Schema::hasColumn('orders', 'payment_gateway')) {
                $table->string('payment_gateway', 20)->nullable()->after('digiflazz_response');
            }
            if (!Schema::hasColumn('orders', 'payment_channel')) {
                $table->string('payment_channel', 50)->nullable()->after('payment_gateway');
            }
            if (!Schema::hasColumn('orders', 'paid_at')) {
                $table->timestamp('paid_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['game_id']);
            $table->dropForeign(['game_item_id']);
            $table->dropColumn([
                'is_topup_order',
                'game_id',
                'game_item_id',
                'game_user_id',
                'game_server_id',
                'contact_type',
                'contact_value',
                'topup_status',
                'digiflazz_trx_id',
                'digiflazz_response',
            ]);

            if (Schema::hasColumn('orders', 'payment_gateway')) {
                $table->dropColumn('payment_gateway');
            }
            if (Schema::hasColumn('orders', 'payment_channel')) {
                $table->dropColumn('payment_channel');
            }
        });
    }
};
