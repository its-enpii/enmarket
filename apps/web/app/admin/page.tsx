import Link from 'next/link';

import { Topbar } from '@/components/admin/Topbar';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/admin/Button';
import { apiGet } from '@/lib/api';
import {
  ORDER_STATUS_LABEL,
  AdminOrderStats,
  type AdminLicenseKey as _UnusedKeep,
} from '@/lib/types';
import { formatDateTime, formatRupiah } from '@/lib/format';
import type {
  Order,
  PaginatedResponse,
  Product,
  ProductStats,
  SingleResponse,
} from '@/lib/types';

export const metadata = {
  title: 'Beranda Admin — enpiistudio Store',
};

async function loadProductStats() {
  try {
    return await apiGet<SingleResponse<ProductStats>>('/api/admin/products/stats');
  } catch {
    return { data: { total: 0, aktif: 0, draft: 0, tidak_dijual: 0 } };
  }
}

async function loadOrderStats() {
  try {
    return await apiGet<SingleResponse<AdminOrderStats>>('/api/admin/orders/stats');
  } catch {
    return {
      data: {
        total: 0,
        pending: 0,
        paid: 0,
        failed: 0,
        expired: 0,
        refunded: 0,
        revenue_month: 0,
        paid_month: 0,
      } satisfies AdminOrderStats,
    };
  }
}

async function loadRecentProducts() {
  try {
    const res = await apiGet<PaginatedResponse<Product>>('/api/admin/products', { per_page: 5 });
    return res.data ?? [];
  } catch {
    return [];
  }
}

async function loadRecentOrders() {
  try {
    const res = await apiGet<PaginatedResponse<Order>>('/api/admin/orders', { per_page: 5 });
    return res.data ?? [];
  } catch {
    return [];
  }
}

async function loadCategoryCount() {
  try {
    const res = await apiGet<{ data: Array<{ id: number }> }>('/api/admin/categories');
    return res.data?.length ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminHomePage() {
  const [productStats, orderStats, recentProducts, recentOrders, categoryCount] =
    await Promise.all([
      loadProductStats(),
      loadOrderStats(),
      loadRecentProducts(),
      loadRecentOrders(),
      loadCategoryCount(),
    ]);

  const tiles = [
    { label: 'Total Produk', value: productStats.data.total, accent: false },
    { label: 'Produk Aktif', value: productStats.data.aktif, accent: true },
    { label: 'Kategori', value: categoryCount, accent: false },
    { label: 'Pesanan Paid (Bulan Ini)', value: orderStats.data.paid_month, accent: true },
    {
      label: 'Pendapatan (Bulan Ini)',
      value: formatRupiah(orderStats.data.revenue_month),
      accent: true,
    },
    { label: 'Order Pending', value: orderStats.data.pending, accent: false },
  ];

  return (
    <>
      <Topbar title="Beranda" subtitle="Ringkasan toko digital enpiistudio." />

      <div className="p-8 space-y-8">
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink/60 mb-3">
            Statistik
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {tiles.map((tile) => (
              <div
                key={tile.label}
                className={
                  'border-2 border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)] ' +
                  (tile.accent ? 'bg-accent' : 'bg-surface')
                }
              >
                <p className="text-xs font-bold uppercase tracking-widest text-ink/70">
                  {tile.label}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-ink mt-2 leading-none">
                  {tile.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pesanan Terbaru */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-ink/60">
              Pesanan Terbaru
            </h2>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm">Lihat semua →</Button>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="bg-surface border-2 border-ink px-6 py-8 text-center shadow-[4px_4px_0_0_var(--color-ink)]">
              <p className="text-ink/60">Belum ada pesanan.</p>
            </div>
          ) : (
            <div className="border-2 border-ink bg-surface shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-surface">
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink">Kode</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink">Pembeli</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink">Total</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink">Status</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, i) => (
                    <tr
                      key={o.kode_order}
                      className={
                        'border-b border-ink/20 last:border-b-0 ' +
                        (i % 2 === 0 ? 'bg-surface' : 'bg-surface/50')
                      }
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${o.kode_order}`}
                          className="font-bold text-primary hover:text-accent underline decoration-2 underline-offset-2"
                        >
                          {o.kode_order}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink/80">{o.nama_pembeli}</td>
                      <td className="px-4 py-3 text-ink font-bold">{o.total_harga_formatted}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} labelMap={ORDER_STATUS_LABEL} />
                      </td>
                      <td className="px-4 py-3 text-ink/60 text-xs">{formatDateTime(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Produk Terbaru */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-ink/60">
              Produk Terbaru
            </h2>
            <Link href="/admin/products">
              <Button variant="ghost" size="sm">Lihat semua →</Button>
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <div className="bg-surface border-2 border-ink px-6 py-12 text-center shadow-[4px_4px_0_0_var(--color-ink)]">
              <p className="text-ink/60 mb-4">Belum ada produk.</p>
              <Link href="/admin/products/new">
                <Button variant="primary">+ Tambah Produk Pertama</Button>
              </Link>
            </div>
          ) : (
            <div className="border-2 border-ink bg-surface shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-surface">
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink">Nama</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink">Kategori</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink">Harga</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink">Status</th>
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs border-b-2 border-ink">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map((p, i) => (
                    <tr
                      key={p.id}
                      className={
                        'border-b border-ink/20 last:border-b-0 ' +
                        (i % 2 === 0 ? 'bg-surface' : 'bg-surface/50')
                      }
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="font-bold text-primary hover:text-accent underline decoration-2 underline-offset-2"
                        >
                          {p.nama}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink/80">{p.category?.nama ?? '—'}</td>
                      <td className="px-4 py-3 text-ink">{formatRupiah(p.harga)}</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-ink/60 text-xs">{formatDateTime(p.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}