import Link from 'next/link';
import { notFound } from 'next/navigation';

import { orderApi } from '@/lib/order-api';
import { formatDateTime, TIPE_LABEL } from '@/lib/format';
import { PublicFetchError } from '@/lib/public-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ kodeOrder: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { kodeOrder } = await params;
  return {
    title: `Pesanan ${kodeOrder} — Sukses`,
    description: 'Pesanan kamu berhasil dibuat.',
    robots: { index: false },
  };
}

export default async function PesananSuksesPage({ params }: PageProps) {
  const { kodeOrder } = await params;

  let order;
  try {
    const res = await orderApi.showPublic(kodeOrder);
    order = res.data;
  } catch (err) {
    if (err instanceof PublicFetchError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  // Kalau status belum paid, redirect ke halaman pembayaran
  if (order.status === 'pending') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
          Menunggu Pembayaran
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-ink">
          Pesanan belum dibayar.
        </h1>
        <p className="mt-4 text-base text-ink/70">
          Selesaikan pembayaran dulu di halaman QRIS.
        </p>
        <Link
          href={`/pembayaran/${order.kode_order}`}
          className="mt-8 inline-block bg-primary text-surface border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all"
        >
          Buka Halaman Pembayaran →
        </Link>
      </div>
    );
  }

  if (order.status === 'expired' || order.status === 'failed') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
          {order.status === 'expired' ? 'Kadaluarsa' : 'Gagal'}
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-ink">
          Pesanan tidak berhasil diproses.
        </h1>
        <p className="mt-4 text-base text-ink/70">
          {order.status === 'expired'
            ? 'QR sudah kadaluarsa. Buat pesanan baru untuk melanjutkan.'
            : 'Pembayaran tidak berhasil. Coba lagi atau hubungi kami.'}
        </p>
        <Link
          href="/katalog"
          className="mt-8 inline-block bg-primary text-surface border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all"
        >
          Belanja Lagi →
        </Link>
      </div>
    );
  }

  // Success state
  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:py-12">
      {/* Hero banner */}
      <div className="bg-primary text-surface border-4 border-ink p-8 shadow-[8px_8px_0_0_var(--color-ink)] text-center mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
          ✓ Pembayaran Diterima
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold leading-tight">
          Terima kasih, {order.nama_pembeli}!
        </h1>
        <p className="mt-3 text-base sm:text-lg text-surface/90">
          Pesanan kamu sedang diproses. Produk akan dikirim via email &amp; WhatsApp
          setelah diproses oleh sistem.
        </p>
      </div>

      {/* Order info */}
      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">
              Kode Order
            </p>
            <p className="text-lg font-bold text-ink mt-1 font-mono break-all">
              {order.kode_order}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">
              Status
            </p>
            <p className="text-lg font-bold text-primary mt-1">Lunas</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">
              Total
            </p>
            <p className="text-lg font-bold text-ink mt-1">{order.total_harga_formatted}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">
              Dibayar pada
            </p>
            <p className="text-sm font-bold text-ink mt-1">
              {order.paid_at ? formatDateTime(order.paid_at) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      {order.items && order.items.length > 0 && (
        <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] mb-6">
          <h2 className="text-lg font-bold text-ink mb-3">Produk</h2>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 border-b-2 border-dashed border-ink/20 pb-2 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="font-bold text-ink truncate">{item.nama_produk}</p>
                  <p className="text-xs text-ink/60">
                    {TIPE_LABEL[item.tipe_produk] ?? item.tipe_produk}
                  </p>
                </div>
                <p className="font-bold text-primary shrink-0">
                  {item.harga_saat_beli_formatted}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Info box */}
      <div className="bg-accent text-ink border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] mb-8">
        <p className="text-sm font-bold mb-2">📦 Apa selanjutnya?</p>
        <ul className="text-sm space-y-1 ml-4 list-disc">
          <li>
            Link download &amp; license key akan dikirim ke{' '}
            <strong>{order.email_pembeli}</strong>.
          </li>
          <li>
            Notifikasi juga akan dikirim via WhatsApp ke{' '}
            <strong>{order.wa_pembeli}</strong>.
          </li>
          <li>
            Simpan <strong>kode order</strong> kamu untuk cek status kapan saja.
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/cek-pesanan?kode_order=${encodeURIComponent(order.kode_order)}`}
          className="inline-block bg-primary text-surface border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all text-center"
        >
          Cek Pesanan Lagi
        </Link>
        <Link
          href="/katalog"
          className="inline-block bg-surface text-ink border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all text-center"
        >
          Belanja Lagi →
        </Link>
      </div>
    </div>
  );
}