import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/Badge';
import { AdminPageHeader, AdminPageBody, StatTile, Text } from '@/components/ui';
import { Button, Eyebrow } from '@/components/ui/neobrutal';
import { Card } from '@/components/ui/neobrutal';
import { NLink } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import { formatDateTime, formatRupiah } from '@/lib/format';

import { ActivityRow } from './ActivityRow';
import type {
  ActivityLog,
  AdminOrderStats,
  AdminProvisioning,
  AdminProvisioningStats,
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
  return buildMetadata({
    title: `${t('title')} — Admin`,
  });
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

async function loadProvisioningStats() {
  try {
    const res = await apiGet<{ data: AdminProvisioningStats }>('/api/admin/account-provisionings/stats');
    return res.data;
  } catch {
    return { menunggu_admin: 0, siap: 0, gagal: 0, dibatalkan: 0, total: 0 } satisfies AdminProvisioningStats;
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
 * Pending activation — 5 paling lama menunggu aktivasi admin.
 */
async function loadPendingProvisionings() {
  try {
    return await apiGet<PaginatedResponse<AdminProvisioning>>('/api/admin/account-provisionings', {
      status: 'menunggu_admin',
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
  const [productStats, orderStats, licenseActive, provisioningStats, pendingRes, pendingProvRes, activityRes] = await Promise.all([
    loadProductStats(),
    loadOrderStats(),
    loadActiveLicenseCount(),
    loadProvisioningStats(),
    loadPendingOrders(),
    loadPendingProvisionings(),
    loadRecentActivity(),
  ]);

  // Stat tiles — grid adaptif lg:grid-cols-4 untuk render 8 tiles cleanly
  const tiles = [
    { label: t('tileStatTotalProducts'), value: String(productStats.data.total), tone: 'surface' as const },
    { label: t('tileStatPendingOrders'), value: String(orderStats.data.pending), tone: 'accent' as const },
    { label: t('tileStatPendingProvisionings'), value: String(provisioningStats.menunggu_admin), tone: 'accent' as const },
    { label: t('tileStatPaidMonth'), value: String(orderStats.data.paid_month), tone: 'primary' as const },
    { label: t('tileStatRevenueMonth'), value: formatRupiah(orderStats.data.revenue_month), tone: 'accent' as const },
    { label: t('tileStatTotalOrders'), value: String(orderStats.data.total), tone: 'primary' as const },
    { label: t('tileStatActiveLicenses'), value: String(licenseActive), tone: 'surface' as const },
  ];

  const pendingOrders = pendingRes.data ?? [];
  const pendingProvisionings = pendingProvRes.data ?? [];
  const recentActivity = activityRes.data ?? [];
  const activityCount = activityRes.meta?.total ?? 0;

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* ───── HEADER ───── */}
      <AdminPageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        subtitle={t('subtitle')}
      />

      {/* ───── STAT TILES ───── */}
      <section>
        <Eyebrow size="label-sm" color="ink-muted" className="mb-3">
          {t('sectionStats')}
        </Eyebrow>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {tiles.map((tile) => {
            const cardVariant =
              tile.tone === 'primary'
                ? 'filled-primary'
                : tile.tone === 'accent'
                  ? 'filled-accent'
                  : 'surface';
            return (
              <StatTile
                key={tile.label}
                label={tile.label}
                value={tile.value}
                variant={cardVariant}
                size="md"
                valueClassName="break-all"
                className="p-4 flex flex-col justify-between"
              />
            );
          })}
        </div>
      </section>

      {/* ───── ANTRIEAN AKTIVASI (FULL WIDTH JIKA ADA DATA) ───── */}
      {pendingProvisionings.length > 0 && (
        <Card variant="surface" className="p-6 border-accent bg-accent/5">
          <div className="flex items-baseline justify-between mb-4 border-b-2 border-ink pb-3">
            <div>
              <Eyebrow size="sm" color="accent">
                {t('provisioningEyebrow')}
              </Eyebrow>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink leading-tight mt-1">
                {t('provisioningTitle')}
              </h2>
            </div>
            <NLink
              href="/admin/account-provisionings?status=menunggu_admin"
              variant="primary"
              underline="static"
              className="font-label text-micro uppercase"
            >
              {t('provisioningViewAll')}
            </NLink>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingProvisionings.map((p) => {
              const order = p.orderItem?.order;
              const productName = p.orderItem?.nama_produk ?? '—';
              return (
                <li key={p.id}>
                  <Card
                    href="/admin/account-provisionings?status=menunggu_admin"
                    variant="surface"
                    elevation={6}
                    hoverElevation={3}
                    className="block p-4 hover:translate-x-[1px] hover:translate-y-[1px]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Badge tone="accent" size="sm" shadow={false} className="text-[9px] mb-1 px-1.5 py-0.5">
                          Aktivasi Manual
                        </Badge>
                        <p className="font-bold text-sm truncate text-ink">{productName}</p>
                        {order && (
                          <Text as="p" variant="muted" className="font-mono mt-0.5 truncate">
                            {order.kode_order} · {order.nama_pembeli}
                          </Text>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-micro text-ink/50">
                          {formatDateTime(p.created_at)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {/* ───── PENDING ORDERS + RECENT ACTIVITY (2-col) ───── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending orders panel */}
        <Card variant="surface" className="p-6 flex flex-col max-h-[28rem]">
          <div className="shrink-0 flex items-baseline justify-between mb-4 border-b-2 border-ink pb-3">
            <div>
              <Eyebrow size="sm" color="accent">
                {t('pendingEyebrow')}
              </Eyebrow>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink leading-tight mt-1">
                {t('pendingTitle')}
              </h2>
            </div>
            <NLink
              href="/admin/orders?status=pending"
              variant="primary"
              underline="static"
              className="font-label text-micro uppercase"
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
                    elevation={6}
                    hoverElevation={2}
                    className="block p-3 hover:bg-accent hover:translate-x-[1px] hover:translate-y-[1px]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate text-ink">
                          {o.nama_pembeli}
                        </p>
                        <p className="font-mono text-micro text-ink/60 mt-0.5 truncate">
                          {o.kode_order}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display font-black text-sm text-primary">
                          {o.total_harga_formatted}
                        </p>
                        <p className="text-micro text-ink/50 mt-0.5">
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
              <Eyebrow size="sm" color="accent">
                {t('activityEyebrow')}
              </Eyebrow>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink leading-tight mt-1">
                {t('activityTitle')}
              </h2>
            </div>
            <span className="text-micro text-ink/50 italic font-body">
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
        <Eyebrow size="label-sm" color="ink-muted" className="mb-3">
          {t('sectionQuick')}
        </Eyebrow>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button href="/admin/products/new" variant="primary" size="md">{t('quickNewProduct')}</Button>
          <Button href="/admin/posts/new" variant="primary" size="md">{t('quickNewPost')}</Button>
          <Button href="/admin/account-provisionings?status=menunggu_admin" variant="accent" size="md">{t('quickProvisioningQueue')}</Button>
          <Button href="/admin/license-keys" variant="surface" size="md">{t('quickLicensePool')}</Button>
        </div>
      </section>
    </div>
  );
}
