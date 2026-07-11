import Link from 'next/link';

import { Button } from '@/components/admin/Button';
import { EmptyState } from '@/components/admin/EmptyState';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Card } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import { formatDateTime, formatRupiah } from '@/lib/format';
import type {
  ActivityLog,
  AdminOrderStats,
  Order,
  PaginatedResponse,
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

async function loadActiveLicenseCount() {
  try {
    const res = await apiGet<PaginatedResponse<unknown>>('/api/admin/license-keys', {
      status: 'aktif',
      per_page: 1,
    });
    return res.meta?.total ?? 0;
  } catch (err) {
    if (err instanceof ApiRequestError) return 0;
    return 0;
  }
}

/**
 * Pending orders — 5 paling lama, butuh perhatian admin. Sort by created_at ASC
 * (paling lama = paling atas) untuk lihat yang sudah lama menunggu.
 */
async function loadPendingOrders() {
  try {
    return await apiGet<PaginatedResponse<Order>>('/api/admin/orders', {
      status: 'pending',
      sort: 'created_at',
      dir: 'asc',
      per_page: 5,
    });
  } catch {
    return { data: [], meta: { current_page: 1, last_page: 1, per_page: 5, total: 0 } };
  }
}

/**
 * Recent activity — last 10 entries dari activity_logs. Ditulis oleh
 * ActivityLogger observer di apps/api setiap kali Product/Post/Order/
 * LicenseKey/SiteSetting di create/update/delete.
 */
async function loadRecentActivity() {
  try {
    return await apiGet<PaginatedResponse<ActivityLog>>('/api/admin/activity', {
      per_page: 10,
    });
  } catch {
    return { data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } };
  }
}

export default async function AdminHomePage() {
  const [productStats, orderStats, licenseActive, pendingRes, activityRes] = await Promise.all([
    loadProductStats(),
    loadOrderStats(),
    loadActiveLicenseCount(),
    loadPendingOrders(),
    loadRecentActivity(),
  ]);

  // 6 stat tiles — alternating 2-2-2: SURF | ACCENT | PRIMARY | ACCENT | PRIMARY | SURF.
  // Ritme warna jelas, ujung-ujung surface jadi frame natural.
  const tiles = [
    { label: 'Total Produk', value: String(productStats.data.total), tone: 'surface' as const },
    { label: 'Pesanan Pending', value: String(orderStats.data.pending), tone: 'accent' as const },
    { label: 'Paid Bulan Ini', value: String(orderStats.data.paid_month), tone: 'primary' as const },
    { label: 'Pendapatan Bulan Ini', value: formatRupiah(orderStats.data.revenue_month), tone: 'accent' as const },
    { label: 'Total Order', value: String(orderStats.data.total), tone: 'primary' as const },
    { label: 'License Aktif', value: String(licenseActive), tone: 'surface' as const },
  ];

  const pendingOrders = pendingRes.data ?? [];
  const recentActivity = activityRes.data ?? [];

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* ───── HEADER ───── */}
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-3">
          ✎ Dashboard
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tight text-ink">
          Beranda<span className="text-primary">.</span>
        </h1>
        <p className="mt-4 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          Ringkasan toko digital enpiistudio. Angka realtime — bukan retrospective.
        </p>
      </header>

      {/* ───── STAT TILES (6) ───── */}
      <section>
        <p className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/60 mb-3">
          ✎ Statistik
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {tiles.map((tile) => {
            // Pakai Card variant langsung untuk primary/accent agar primitive's
            // fill (bg-primary/bg-accent) menang dari CSS source order —
            // kalau pakai className, override sering kalah kalau bg-surface
            // didefine lebih dulu di Tailwind v4 output.
            const cardVariant =
              tile.tone === 'primary'
                ? 'filled-primary'
                : tile.tone === 'accent'
                  ? 'filled-accent'
                  : 'surface';
            return (
              <Card key={tile.label} variant={cardVariant} className="p-4">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">
                  {tile.label}
                </p>
                <p className="mt-2 font-display text-2xl md:text-3xl font-black leading-none break-all">
                  {tile.value}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ───── PENDING ORDERS + RECENT ACTIVITY (2-col) ───── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending orders panel */}
        <Card variant="surface" className="p-6">
          <div className="flex items-baseline justify-between mb-4 border-b-2 border-ink pb-3">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
                ✎ Needs attention
              </p>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink leading-tight mt-1">
                Pending Orders
              </h2>
            </div>
            <Link
              href="/admin/orders?status=pending"
              className="font-label text-[10px] uppercase font-bold text-primary hover:text-accent underline decoration-2 underline-offset-2"
            >
              Lihat semua →
            </Link>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-display text-lg font-black uppercase text-ink/60">
                Tidak ada order pending 🎉
              </p>
              <p className="mt-1 font-body text-body-sm text-ink/50">
                Semua pesanan sudah diproses — tinggal nunggu paid.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {pendingOrders.map((o) => (
                <li key={o.kode_order}>
                  <Link
                    href={`/admin/orders/${o.kode_order}`}
                    className="block p-3 border-2 border-ink bg-surface hover:bg-accent hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-ink)] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate text-ink">
                          {o.nama_pembeli}
                        </p>
                        <p className="font-mono text-[10px] text-ink/60 mt-0.5 truncate">
                          {o.kode_order}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display font-black text-sm text-primary">
                          {o.total_harga_formatted}
                        </p>
                        <p className="text-[10px] text-ink/50 mt-0.5">
                          {formatDateTime(o.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent activity panel — real data dari ActivityLogger observer */}
        <Card variant="surface" className="p-6">
          <div className="flex items-baseline justify-between mb-4 border-b-2 border-ink pb-3">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
                ✎ Recent
              </p>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink leading-tight mt-1">
                Activity
              </h2>
            </div>
            <span className="text-[10px] text-ink/50 italic font-body">
              {activityRes.meta?.total ?? 0} entr{activityRes.meta?.total === 1 ? 'y' : 'ies'}
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-display text-lg font-black uppercase text-ink/60">
                Belum ada aktivitas
              </p>
              <p className="mt-1 font-body text-body-sm text-ink/50">
                Edit produk, post, atau order — log akan muncul di sini.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((entry) => (
                <ActivityRow key={entry.id} entry={entry} />
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* ───── QUICK SHORTCUTS ───── */}
      <section>
        <p className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/60 mb-3">
          ✎ Quick action
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button href="/admin/products/new" variant="primary" size="md">+ Produk Baru</Button>
          <Button href="/admin/posts/new" variant="primary" size="md">+ Catatan Baru</Button>
          <Button href="/admin/orders?status=pending" variant="accent" size="md">Cek Pending</Button>
          <Button href="/admin/license-keys" variant="surface" size="md">License Pool</Button>
        </div>
      </section>
    </div>
  );
}

// ───── Activity row helper ─────

const ACTION_LABEL: Record<string, { icon: string; verb: string }> = {
  created: { icon: '+', verb: 'membuat' },
  updated: { icon: '✎', verb: 'memperbarui' },
  status_changed: { icon: '⇄', verb: 'mengubah status' },
  deleted: { icon: '−', verb: 'menghapus' },
  maintenance_toggled: { icon: '⚠', verb: 'maintenance' },
};

const SUBJECT_LABEL: Record<string, string> = {
  product: 'Produk',
  post: 'Catatan',
  order: 'Order',
  license_key: 'License',
  setting: 'Setting',
  maintenance: 'Maintenance',
};

function ActivityRow({ entry }: { entry: ActivityLog }) {
  const actionMeta = ACTION_LABEL[entry.action] ?? { icon: '•', verb: entry.action };
  const subjectName = SUBJECT_LABEL[entry.subject_type] ?? entry.subject_type;
  const detail = entry.subject_label ?? entry.subject_id ?? '';

  return (
    <li className="flex items-start gap-3 p-3 border-2 border-ink bg-surface hover:bg-accent transition-colors">
      <span
        aria-hidden="true"
        className="shrink-0 w-8 h-8 flex items-center justify-center border-2 border-ink bg-primary text-surface font-display font-black text-base"
      >
        {actionMeta.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm text-ink">
          <span className="font-bold">{actionMeta.verb}</span>{' '}
          <span className="text-ink/60 uppercase font-bold tracking-wide text-[10px]">
            {subjectName}
          </span>
          {detail && (
            <>
              {' '}
              <span className="font-bold truncate">"{detail}"</span>
            </>
          )}
        </p>
        <p className="mt-1 text-[10px] text-ink/50 italic">
          {formatDateTime(entry.created_at)}
        </p>
      </div>
    </li>
  );
}