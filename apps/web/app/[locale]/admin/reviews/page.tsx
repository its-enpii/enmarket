import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { AdminListProvider } from '@/components/admin/AdminListProvider';
import { AdminTableHeader } from '@/components/admin/AdminTableHeader';
import { Button, Card } from '@/components/ui/neobrutal';
import { DataTable, Column } from '@/components/admin/DataTable';
import { DataTableArea } from '@/components/admin/DataTableArea';
import { EmptyState } from '@/components/admin/EmptyState';
import { Pagination } from '@/components/admin/Pagination';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { PaginatedResponse, Review, ReviewStats, SingleResponse } from '@/lib/types';
import { ReviewRowActions } from './ReviewRowActions';

interface Props {
  searchParams: Promise<{ q?: string; is_published?: string; rating?: string; page?: string }>;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.reviews' });
  return buildMetadata({
    title: `${t('listTitle')} — Admin`,
  });
}

async function loadReviews(searchParams: { q?: string; is_published?: string; rating?: string; page?: string }) {
  const query: Record<string, string | number> = {};
  if (searchParams.q) query.q = searchParams.q;
  if (searchParams.is_published !== undefined) query.is_published = searchParams.is_published;
  if (searchParams.rating) query.rating = searchParams.rating;
  if (searchParams.page) query.page = searchParams.page;

  const [res, statsRes] = await Promise.all([
    apiGet<PaginatedResponse<Review>>('/api/admin/reviews', query),
    apiGet<SingleResponse<ReviewStats>>('/api/admin/reviews/stats'),
  ]);

  return {
    reviews: res.data ?? [],
    meta: res.meta,
    stats: statsRes.data,
  };
}

export default async function ReviewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations('admin.reviews');
  const tShared = await getTranslations('admin.shared');

  const { reviews, meta, stats } = await loadReviews(params);

  const columns: Column<Review>[] = [
    {
      key: 'product',
      header: t('columns.product'),
      width: '25%',
      render: (row) => (
        <div>
          <p className="font-bold text-ink truncate max-w-xs">{row.product?.nama || '-'}</p>
          <p className="text-[11px] font-mono text-ink/60">#{row.order_kode}</p>
        </div>
      ),
    },
    {
      key: 'buyer',
      header: t('columns.buyer'),
      width: '20%',
      render: (row) => (
        <div>
          <p className="font-bold text-ink truncate">{row.buyer_name}</p>
          <p className="text-[11px] text-ink/60">{row.created_at ? formatDate(row.created_at) : '-'}</p>
        </div>
      ),
    },
    {
      key: 'rating',
      header: t('columns.rating'),
      width: '15%',
      render: (row) => (
        <div className="flex items-center gap-1 font-mono font-bold text-sm">
          <span className="text-accent text-base">★</span>
          <span>{row.rating} / 5</span>
        </div>
      ),
    },
    {
      key: 'comment',
      header: t('columns.comment'),
      width: '25%',
      render: (row) => (
        <p className="text-xs text-ink/80 line-clamp-2" title={row.comment || '-'}>
          {row.comment || <span className="italic text-ink/40">{t('noComment')}</span>}
        </p>
      ),
    },
    {
      key: 'status',
      header: t('columns.status'),
      width: '10%',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
            row.is_published
              ? 'bg-green-100 border-green-700 text-green-900'
              : 'bg-gray-100 border-gray-600 text-gray-700'
          }`}
        >
          {row.is_published ? t('published') : t('hidden')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('columns.actions'),
      width: '10%',
      render: (row) => <ReviewRowActions review={row} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Tiles */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="surface" hoverable={false} className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">{t('stats.total')}</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-ink mt-1">{stats.total}</p>
          </Card>
          <Card variant="surface" hoverable={false} className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">{t('stats.avgRating')}</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-accent mt-1">
              ★ {stats.average_rating.toFixed(1)}
            </p>
          </Card>
          <Card variant="surface" hoverable={false} className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">{t('stats.published')}</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-green-700 mt-1">{stats.published}</p>
          </Card>
          <Card variant="surface" hoverable={false} className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">{t('stats.hidden')}</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-ink/50 mt-1">{stats.hidden}</p>
          </Card>
        </div>
      )}

      <AdminListProvider>
        <Card variant="surface" hoverable={false} className="p-0 overflow-hidden">
          <AdminTableHeader
            q={params.q ?? ''}
            sort="id"
            dir="desc"
            placeholder={t('searchPlaceholder')}
            filters={[
              {
                key: 'is_published',
                label: t('filterStatus'),
                options: [
                  { label: t('filterAllStatus'), value: '' },
                  { label: t('published'), value: 'true' },
                  { label: t('hidden'), value: 'false' },
                ],
              },
              {
                key: 'rating',
                label: t('filterRating'),
                options: [
                  { label: t('filterAllRating'), value: '' },
                  { label: '5 ★', value: '5' },
                  { label: '4 ★', value: '4' },
                  { label: '3 ★', value: '3' },
                  { label: '2 ★', value: '2' },
                  { label: '1 ★', value: '1' },
                ],
              },
            ]}
          />

          <DataTableArea
            columnCount={columns.length}
            columnWidths={columns.map((c) => c.width)}
            skeletonCount={10}
          >
            <DataTable
              columns={columns}
              rows={reviews}
              rowKey={(r) => r.id}
              emptyState={
                params.q ? (
                  <EmptyState
                    title={t('empty.noResults', { query: params.q })}
                    body={t('empty.noResultsHint')}
                  />
                ) : (
                  <EmptyState
                    title={t('empty.noneYet')}
                    body={t('empty.noneYetHint')}
                  />
                )
              }
            />
          </DataTableArea>

          {meta && meta.last_page > 1 && (
            <div className="p-4 border-t-2 border-ink bg-surface/50">
              <Pagination
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                basePath="/admin/reviews"
                queryParams={params}
              />
            </div>
          )}
        </Card>
      </AdminListProvider>
    </div>
  );
}
