import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/neobrutal';
import { Card } from '@/components/ui/neobrutal';
import { NLink } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import { formatDateTime, formatRupiah } from '@/lib/format';

import { ActivityRow } from './ActivityRow';
import type {
  ActivityLog,
  AdminOrderStats,
  Order,
  PaginatedResponse,
  ProductStats,
  SingleResponse,
} from '@/lib/types';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.dashboard' });
  return { title: `${t('title')} — Admin` };
}

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
  const t = await getTranslations('admin.dashboard');
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
    { label: t('tileStatTotalProducts'), value: String(productStats.data.total), tone: 'surface' as const },
    { label: t('tileStatPendingOrders'), value: String(orderStats.data.pending), tone: 'accent' as const },
    { label: t('tileStatPaidMonth'), value: String(orderStats.data.paid_month), tone: 'primary' as const },
    { label: t('tileStatRevenueMonth'), value: formatRupiah(orderStats.data.revenue_month), tone: 'accent' as const },
    { label: t('tileStatTotalOrders'), value: String(orderStats.data.total), tone: 'primary' as const },
    { label: t('tileStatActiveLicenses'), value: String(licenseActive), tone: 'surface' as const },
  ];

  const pendingOrders = pendingRes.data ?? [];
  const recentActivity = activityRes.data ?? [];
  const activityCount = activityRes.meta?.total ?? 0;

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* ───── HEADER ───── */}
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-3">
          {t('eyebrow')}
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tight text-ink">
          {t('title')}<span className="text-primary">.</span>
        </h1>
        <p className="mt-4 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          {t('subtitle')}
        </p>
      </header>

      {/* ───── STAT TILES (6) ───── */}
      <section>
        <p className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/60 mb-3">
          {t('sectionStats')}
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
        <Card variant="surface" className="p-6 flex flex-col max-h-[28rem]">
          <div className="shrink-0 flex items-baseline justify-between mb-4 border-b-2 border-ink pb-3">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
                {t('pendingEyebrow')}
              </p>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink leading-tight mt-1">
                {t('pendingTitle')}
              </h2>
            </div>
            <NLink
              href="/admin/orders?status=pending"
              variant="primary"
              underline="static"
              className="font-label text-[10px] uppercase"
            >
              {t('pendingViewAll')}
            </NLink>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-display text-lg font-black uppercase text-ink/60">
                {t('pendingEmpty')}
              </p>
              <p className="mt-1 font-body text-body-sm text-ink/50">
                {t('pendingEmptyHint')}
              </p>
            </div>
          ) : (
            <ul className="space-y-2 overflow-y-auto pr-3 -mr-3 flex-1 min-h-0">
              {pendingOrders.map((o) => (
                <li key={o.kode_order}>
                  <Card
                    href={`/admin/orders/${o.kode_order}`}
                    variant="surface"
                    className="block p-3 hover:bg-accent hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-ink)]"
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
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent activity panel — real data dari ActivityLogger observer */}
        <Card variant="surface" className="p-6 flex flex-col max-h-[28rem]">
          <div className="shrink-0 flex items-baseline justify-between mb-4 border-b-2 border-ink pb-3">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
                {t('activityEyebrow')}
              </p>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink leading-tight mt-1">
                {t('activityTitle')}
              </h2>
            </div>
            <span className="text-[10px] text-ink/50 italic font-body">
              {t('activityCount', { count: activityCount })}
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-display text-lg font-black uppercase text-ink/60">
                {t('activityEmpty')}
              </p>
              <p className="mt-1 font-body text-body-sm text-ink/50">
                {t('activityEmptyHint')}
              </p>
            </div>
          ) : (
            <ul className="space-y-3 overflow-y-auto pr-3 -mr-3 flex-1 min-h-0">
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
          {t('sectionQuick')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button href="/admin/products/new" variant="primary" size="md">{t('quickNewProduct')}</Button>
          <Button href="/admin/posts/new" variant="primary" size="md">{t('quickNewPost')}</Button>
          <Button href="/admin/orders?status=pending" variant="accent" size="md">{t('quickCheckPending')}</Button>
          <Button href="/admin/license-keys" variant="surface" size="md">{t('quickLicensePool')}</Button>
        </div>
      </section>
    </div>
  );
}