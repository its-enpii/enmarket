import Link from 'next/link';

import { Topbar } from '@/components/admin/Topbar';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/admin/Button';
import { apiGet } from '@/lib/api';
import { formatDateTime, formatRupiah } from '@/lib/format';
import type { PaginatedResponse, Product, ProductStats, SingleResponse } from '@/lib/types';

export const metadata = {
  title: 'Beranda Admin — enpiistudio Store',
};

async function loadStats() {
  try {
    return await apiGet<SingleResponse<ProductStats>>('/api/admin/products/stats');
  } catch {
    return { data: { total: 0, aktif: 0, draft: 0, tidak_dijual: 0 } };
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

async function loadCategoryCount() {
  try {
    const res = await apiGet<{ data: Array<{ id: number }> }>('/api/admin/categories');
    return res.data?.length ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminHomePage() {
  const [stats, recent, categoryCount] = await Promise.all([
    loadStats(),
    loadRecentProducts(),
    loadCategoryCount(),
  ]);

  const tiles = [
    { label: 'Total Produk', value: stats.data.total, accent: false },
    { label: 'Aktif', value: stats.data.aktif, accent: true },
    { label: 'Draft', value: stats.data.draft, accent: false },
    { label: 'Kategori', value: categoryCount, accent: false },
  ];

  return (
    <>
      <Topbar title="Beranda" subtitle="Ringkasan toko digital enpiistudio." />

      <div className="p-8 space-y-8">
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink/60 mb-3">
            Statistik
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tiles.map((tile) => (
              <div
                key={tile.label}
                className={
                  'border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] ' +
                  (tile.accent ? 'bg-accent' : 'bg-surface')
                }
              >
                <p className="text-xs font-bold uppercase tracking-widest text-ink/70">
                  {tile.label}
                </p>
                <p className="text-4xl font-bold text-ink mt-2 leading-none">
                  {tile.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-ink/60">
              Produk Terbaru
            </h2>
            <Link href="/admin/products">
              <Button variant="ghost" size="sm">Lihat semua →</Button>
            </Link>
          </div>

          {recent.length === 0 ? (
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
                  {recent.map((p, i) => (
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