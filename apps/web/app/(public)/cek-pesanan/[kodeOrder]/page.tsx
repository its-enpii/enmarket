import Link from 'next/link';
import { notFound } from 'next/navigation';

import { orderApi } from '@/lib/order-api';
import { formatDateTime, STATUS_LABEL, TIPE_LABEL } from '@/lib/format';
import { PublicFetchError } from '@/lib/public-api';

import { StatusPoller } from './StatusPoller';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ kodeOrder: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { kodeOrder } = await params;
  return {
    title: `Cek Pesanan ${kodeOrder} — enpiistudio Store`,
    description: 'Detail pesanan.',
    robots: { index: false },
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-accent text-ink',
  paid: 'bg-primary text-surface',
  failed: 'bg-ink text-surface',
  expired: 'bg-ink text-surface',
  refunded: 'bg-surface text-ink border-2',
};

export default async function CekPesananDetailPage({ params }: PageProps) {
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

  const statusColor = STATUS_COLORS[order.status] ?? 'bg-surface text-ink border-2';

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:py-12">
      <Link
        href="/cek-pesanan"
        className="inline-block mb-4 text-sm font-bold text-ink/60 hover:text-primary"
      >
        ← Cek Pesanan Lain
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2">Detail Pesanan</h1>
      <p className="text-sm text-ink/60 mb-6">
        Kode order <span className="font-mono font-bold">{order.kode_order}</span>
      </p>

      <StatusPoller kodeOrder={order.kode_order} initialStatus={order.status} />

      {/* Status banner */}
      <div className={`${statusColor} border-2 border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)] mb-6`}>
        <p className="text-xs font-bold uppercase tracking-wider opacity-80">
          Status
        </p>
        <p className="text-2xl sm:text-3xl font-bold mt-1">
          {STATUS_LABEL[order.status] ?? order.status}
        </p>
        {order.status === 'pending' && (
          <p className="text-xs mt-2 opacity-80">
            Sedang menunggu pembayaran. Halaman auto-refresh tiap 10 detik.
          </p>
        )}
        {order.status === 'paid' && (
          <p className="text-xs mt-2 opacity-80">
            Pembayaran diterima pada {order.paid_at ? formatDateTime(order.paid_at) : '—'}.
          </p>
        )}
      </div>

      {/* Order info */}
      <div className="bg-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">Nama</p>
            <p className="text-sm font-bold text-ink mt-0.5">{order.nama_pembeli}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">Email</p>
            <p className="text-sm font-bold text-ink mt-0.5">{order.email_pembeli}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">WhatsApp</p>
            <p className="text-sm font-bold text-ink mt-0.5">{order.wa_pembeli}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">Total</p>
            <p className="text-lg font-bold text-primary mt-0.5">
              {order.total_harga_formatted}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      {order.items && order.items.length > 0 && (
        <div className="bg-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] mb-6">
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

      {/* Action hint */}
      {order.status === 'pending' && (
        <Link
          href={`/pembayaran/${order.kode_order}`}
          className="block w-full bg-primary text-surface border-2 border-ink p-4 text-center font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all"
        >
          Lanjut Bayar →
        </Link>
      )}
    </div>
  );
}