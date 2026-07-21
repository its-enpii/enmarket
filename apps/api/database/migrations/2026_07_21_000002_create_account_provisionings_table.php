<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel `account_provisionings` — antrian aktivasi akun manual.
 *
 * Satu row per order_item bertipe account_manual. Lifecycle:
 *   menunggu_admin → siap (admin sudah input kredensial + notif terkirim)
 *                → gagal / dibatalkan (manual override)
 *
 * credentials: JSON fleksibel ({username, password, server, profile, ...})
 *              — null sampai admin submit form. Sembunyikan di public view.
 *
 * ready_by_admin: string identifier siapa yang mark-ready. Repo enmarket
 * tidak punya tabel admins (auth pakai static token env), jadi cukup
 * simpan label/suffix token untuk audit trail.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('account_provisionings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->unique()->constrained('order_items')->cascadeOnDelete();
            $table->enum('status', ['menunggu_admin', 'siap', 'gagal', 'dibatalkan'])->default('menunggu_admin');
            $table->json('credentials')->nullable();
            $table->text('catatan_admin')->nullable();
            $table->string('ready_by_admin', 64)->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->timestamp('email_sent_at')->nullable();
            $table->timestamp('wa_sent_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_provisionings');
    }
};
