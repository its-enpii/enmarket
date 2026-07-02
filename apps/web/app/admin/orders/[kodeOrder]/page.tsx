import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/admin/Button';
import { Topbar } from '@/components/admin/Topbar';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ApiRequestError, apiGet } from '@/lib/api';
import {
  formatDateTime,
  formatRupiah,
  TIPE_LABEL,
} from '@/lib/format';
import {
  ORDER_STATUS_LABEL,
  type Order,
  type OrderDeliveryInfo,
  type SingleResponse,
} from '@/lib/types';

import { GenerateDeliveriesForm } from '../GenerateDeliveriesForm';
import { RegenerateTokenForm } from '../RegenerateTokenForm';
import { ResendNotificationForm } from '../ResendNotificationForm';

interface Props {
  params: Promise<{ kodeOrder: string }>;
}

async function loadOrder(kodeOrder: string) {
  try {
    const res = await apiGet<SingleResponse<Order>>(`/api/admin/orders/${kodeOrder}`);
    return res.data;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) {
      notFound();
    }
    throw err;
  }
}

export default async function OrderDetailPage({ params }: Props) {
  const { kodeOrder } = await params;
  const order = await loadOrder(kodeOrder);

  if (!order) notFound();

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

  const items = order.items ?? [];
  const itemsWithoutDelivery = items.filter((it) => !it.delivery).length;

  return (
    <>
      <Topbar
        title={`Order ${order.kode_order}`}
        subtitle={`Dibuat ${formatDateTime(order.created_at)}${order.paid_at ? ` • Paid ${formatDateTime(order.paid_at)}` : ''}`}
      />

      <div className="p-8 max-w-6xl space-y-6">
        {/* Quick info + actions */}
        <div className="bg-surface border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)] flex flex-wrap items-center gap-3">
          <StatusBadge status={order.status} labelMap={ORDER_STATUS_LABEL} />
          <span className="text-sm">
            <strong>Total:</strong> {order.total_harga_formatted}
          </span>
          <span className="text-sm">
            <strong>{items.length}</strong> produk
          </span>

          <div className="ml-auto flex flex-wrap gap-2">
            {order.status === 'paid' && (
              <ResendNotificationForm kodeOrder={order.kode_order} />
            )}
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm">← Daftar Pesanan</Button>
            </Link>
          </div>
        </div>

        {/* Buyer card */}
        <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)]">
          <h2 className="text-lg font-bold mb-3">Data Pembeli</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-ink/60 uppercase text-xs font-bold tracking-wide">Nama</dt>
              <dd className="font-bold">{order.nama_pembeli}</dd>
            </div>
            <div>
              <dt className="text-ink/60 uppercase text-xs font-bold tracking-wide">Email</dt>
              <dd className="font-bold">{order.email_pembeli}</dd>
            </div>
            <div>
              <dt className="text-ink/60 uppercase text-xs font-bold tracking-wide">WhatsApp</dt>
              <dd className="font-bold">{order.wa_pembeli}</dd>
            </div>
            <div>
              <dt className="text-ink/60 uppercase text-xs font-bold tracking-wide">Tripay Ref</dt>
              <dd className="font-mono text-xs">{order.tripay_reference ?? '—'}</dd>
            </div>
          </dl>
        </div>

        {/* Re-trigger delivery kalau ada item tanpa delivery */}
        {order.status === 'paid' && itemsWithoutDelivery > 0 && (
          <div className="bg-accent border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)] flex flex-wrap items-center gap-3">
            <span className="font-bold text-sm">
              ⚠ {itemsWithoutDelivery} produk belum punya delivery row.
            </span>
            <div className="ml-auto">
              <GenerateDeliveriesForm kodeOrder={order.kode_order} />
            </div>
          </div>
        )}

        {/* Items table */}
        <div className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-ink bg-primary text-surface">
            <h2 className="font-bold">Item Pesanan</h2>
          </div>

          {items.length === 0 ? (
            <div className="px-6 py-8 text-center text-ink/60">Tidak ada item.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface/50">
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink/30">Produk</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink/30">Tipe</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink/30">Harga</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink/30">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const delivery: OrderDeliveryInfo | null = item.delivery ?? null;
                    const tokenValid = !!delivery?.download_url;

                    return (
                      <tr
                        key={item.id}
                        className={
                          'border-b border-ink/20 last:border-b-0 ' +
                          (i % 2 === 0 ? 'bg-surface' : 'bg-surface/50')
                        }
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/products/${item.product_id}`}
                            className="font-bold text-primary hover:text-accent underline decoration-2 underline-offset-2"
                          >
                            {item.nama_produk}
                          </Link>
                          {delivery?.license_key && (
                            <p className="text-xs text-ink/70 mt-1 font-mono">
                              Key: <span className="bg-ink/10 px-1.5 py-0.5 rounded">{delivery.license_key}</span>
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs uppercase font-bold tracking-wide">
                          {TIPE_LABEL[item.tipe_produk] ?? item.tipe_produk}
                        </td>
                        <td className="px-4 py-3 font-bold">{item.harga_saat_beli_formatted}</td>
                        <td className="px-4 py-3">
                          {delivery ? (
                            <div className="space-y-2">
                              {delivery.has_download && (
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={
                                    'text-xs font-bold px-2 py-0.5 border-2 border-ink ' +
                                    (tokenValid ? 'bg-accent text-ink' : 'bg-ink text-surface')
                                  }>
                                    {tokenValid ? '✓ Token Aktif' : '✗ Token Expired'}
                                  </span>
                                  {delivery.download_token && (
                                    <code className="text-xs bg-ink/5 px-2 py-1 border border-ink/20 font-mono">
                                      {delivery.download_token.substring(0, 16)}…
                                    </code>
                                  )}
                                  {delivery.token_expired_at && (
                                    <span className="text-xs text-ink/60">
                                      sampai {formatDateTime(delivery.token_expired_at)}
                                    </span>
                                  )}
                                </div>
                              )}
                              {(delivery.email_sent_at || delivery.wa_sent_at) && (
                                <div className="flex flex-wrap gap-2 text-xs">
                                  {delivery.email_sent_at && (
                                    <span className="text-ink/70">
                                      📧 {formatDateTime(delivery.email_sent_at)}
                                    </span>
                                  )}
                                  {delivery.wa_sent_at && (
                                    <span className="text-ink/70">
                                      💬 {formatDateTime(delivery.wa_sent_at)}
                                    </span>
                                  )}
                                </div>
                              )}
                              {order.status === 'paid' && delivery.has_download && (
                                <RegenerateTokenForm
                                  kodeOrder={order.kode_order}
                                  orderItemId={item.id}
                                />
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-ink/50 italic">Belum di-generate</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* QR info */}
        {order.qr_url && order.status === 'pending' && (
          <div className="bg-surface border-2 border-ink p-6 shadow-[3px_3px_0_0_var(--color-ink)]">
            <h2 className="text-lg font-bold mb-2">Pembayaran QRIS</h2>
            <p className="text-sm text-ink/70 mb-3">
              Pelanggan harus scan QR di halaman <code>/pembayaran/{order.kode_order}</code>.
              {order.qr_expired_at && (
                <> Expired: <strong>{formatDateTime(order.qr_expired_at)}</strong></>
              )}
            </p>
            <a
              href={order.qr_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline text-primary hover:text-accent"
            >
              {order.qr_url}
            </a>
            <details className="mt-3">
              <summary className="text-xs font-bold cursor-pointer text-ink/70 hover:text-ink">
                Lihat raw QR string
              </summary>
              <pre className="text-xs bg-ink/5 p-2 mt-2 border border-ink/20 overflow-x-auto font-mono">
                {order.qr_string ?? '(empty)'}
              </pre>
            </details>
          </div>
        )}
      </div>
    </>
  );
}