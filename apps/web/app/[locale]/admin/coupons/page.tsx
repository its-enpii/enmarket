import { getTranslations } from 'next-intl/server';

import { AdminListProvider } from '@/components/admin/AdminListProvider';
import { AdminTableHeader } from '@/components/admin/AdminTableHeader';
import { Button } from '@/components/ui/neobrutal';
import { Card } from '@/components/ui/neobrutal';
import { DataTable, Column } from '@/components/admin/DataTable';
import { DataTableArea } from '@/components/admin/DataTableArea';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { EmptyState } from '@/components/admin/EmptyState';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { apiGet } from '@/lib/api';
import { formatDate, formatRupiah } from '@/lib/format';
import type { Coupon, CouponStats, PaginatedResponse, SingleResponse } from '@/lib/types';

import { deleteCoupon } from './actions';

interface Props {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.coupons' });
  return { title: `${t('listTitle')} — Admin` };
}

async function loadCoupons(searchParams: { q?: string; status?: string; page?: string }) {
  const query: Record<string, string | number> = {};
  if (searchParams.q) query.q = searchParams.q;
  if (searchParams.status) query.status = searchParams.status;
  if (searchParams.page) query.page = searchParams.page;

  const [res, statsRes] = await Promise.all([
    apiGet<PaginatedResponse<Coupon>>('/api/admin/coupons', query),
    apiGet<SingleResponse<CouponStats>>('/api/admin/coupons/stats'),
  ]);

  return {
    coupons: res.data ?? [],
    meta: res.meta,
    stats: statsRes.data,
  };
}

export default async function CouponsPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations('admin.coupons');
  const tBtns = await getTranslations('common.buttons');

  const { coupons, meta, stats } = await loadCoupons(params);
  const q = params.q ?? '';

  const columns: Column<Coupon>[] = [
    {
      key: 'code',
      header: t('columns.code'),
      render: (c) => (
        <code className="text-sm font-bold bg-surface border-2 border-ink px-2.5 py-1 uppercase tracking-wider">
          {c.code}
        </code>
      ),
    },
    {
      key: 'type',
      header: t('columns.type'),
      render: (c) => (
        <span className="text-xs uppercase font-bold text-ink/80">
          {c.type === 'percent' ? t('form.typePercent') : t('form.typeFixed')}
        </span>
      ),
    },
    {
      key: 'value',
      header: t('columns.value'),
      render: (c) => (
        <span className="font-bold text-primary">
          {c.type === 'percent' ? `${c.value}%` : formatRupiah(c.value)}
        </span>
      ),
    },
    {
      key: 'usage',
      header: t('columns.usage'),
      render: (c) => (
        <span className="text-xs font-mono">
          {c.used_count} / {c.max_uses !== null ? c.max_uses : '∞'}
        </span>
      ),
    },
    {
      key: 'validity',
      header: t('columns.validity'),
      render: (c) => (
        <div className="text-xs text-ink/70 space-y-0.5">
          {c.valid_until ? (
            <span>s/d {formatDate(c.valid_until)}</span>
          ) : (
            <span className="italic">Tanpa batas waktu</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: t('columns.status'),
      width: '120px',
      render: (c) => (
        <StatusBadge
          status={c.active ? 'active' : 'inactive'}
          labelMap={{
            active: t('status.active'),
            inactive: t('status.inactive'),
          }}
          bgOverride={{
            active: 'accent',
            inactive: 'surface',
          }}
        />
      ),
    },
    {
      key: 'aksi',
      header: t('columns.actions'),
      width: '180px',
      render: (c) => (
        <div className="flex gap-2">
          <Button href={`/admin/coupons/${c.id}`} variant="ghost" size="sm">
            {tBtns('edit')}
          </Button>
          {c.active && (
            <DeleteButton
              itemId={c.id}
              itemName={c.code}
              confirmMessage={t('deleteConfirm', { code: c.code })}
              action={deleteCoupon}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminListProvider>
      <div className="p-6 sm:p-8 space-y-6">
        <header className="border-b-4 border-ink pb-6">
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
            {t('listEyebrow')}
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
            {t('listTitle')}<span className="text-primary">.</span>
          </h1>
          <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
            {t('listSubtitle')}
          </p>
        </header>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card variant="surface" hoverable={false} className="p-4">
              <p className="text-xs uppercase font-bold text-ink/60">{t('stats.total')}</p>
              <p className="font-display text-3xl font-black text-ink mt-1">{stats.total}</p>
            </Card>
            <Card variant="surface" hoverable={false} className="p-4">
              <p className="text-xs uppercase font-bold text-ink/60">{t('stats.active')}</p>
              <p className="font-display text-3xl font-black text-primary mt-1">{stats.active}</p>
            </Card>
            <Card variant="surface" hoverable={false} className="p-4">
              <p className="text-xs uppercase font-bold text-ink/60">{t('stats.inactive')}</p>
              <p className="font-display text-3xl font-black text-ink/50 mt-1">{stats.inactive}</p>
            </Card>
            <Card variant="surface" hoverable={false} className="p-4">
              <p className="text-xs uppercase font-bold text-ink/60">{t('stats.expired')}</p>
              <p className="font-display text-3xl font-black text-accent mt-1">{stats.expired}</p>
            </Card>
          </div>
        )}

        <AdminTableHeader
          q={q}
          sort="id"
          dir="desc"
          placeholder={t('searchPlaceholder')}
          action={
            <Button href="/admin/coupons/new" variant="primary" size="md">
              {t('newButton')}
            </Button>
          }
        />

        <DataTableArea
          columnCount={columns.length}
          columnWidths={columns.map((c) => c.width)}
          skeletonCount={10}
        >
          <DataTable
            columns={columns}
            rows={coupons}
            rowKey={(c) => c.id}
            emptyState={
              <EmptyState
                title={q ? t('empty.noResults', { query: q }) : t('empty.noneYet')}
                body={q ? t('empty.noResultsHint') : t('empty.noneYetHint')}
                action={
                  !q && (
                    <Button href="/admin/coupons/new" variant="primary" size="md">
                      {t('newButton')}
                    </Button>
                  )
                }
              />
            }
          />
        </DataTableArea>

        {meta && meta.last_page > 1 && (
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            basePath="/admin/coupons"
            queryParams={{ ...(params.q ? { q: params.q } : {}), ...(params.status ? { status: params.status } : {}) }}
          />
        )}
      </div>
    </AdminListProvider>
  );
}
