import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { AdminListProvider } from '@/components/admin/AdminListProvider';
import { AdminTableHeader } from '@/components/admin/AdminTableHeader';
import { Button, Card } from '@/components/ui/neobrutal';
import { DataTable, Column } from '@/components/admin/DataTable';
import { DataTableArea } from '@/components/admin/DataTableArea';
import { EmptyState } from '@/components/admin/EmptyState';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { CustomRequest, CustomRequestStats, PaginatedResponse, SingleResponse } from '@/lib/types';

interface Props {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.customRequests' });
  return buildMetadata({
    title: `${t('listTitle')} — Admin`,
  });
}

async function loadRequests(searchParams: { q?: string; status?: string; page?: string }) {
  const query: Record<string, string | number> = {};
  if (searchParams.q) query.q = searchParams.q;
  if (searchParams.status) query.status = searchParams.status;
  if (searchParams.page) query.page = searchParams.page;

  const [res, statsRes] = await Promise.all([
    apiGet<PaginatedResponse<CustomRequest>>('/api/admin/custom-requests', query),
    apiGet<SingleResponse<CustomRequestStats>>('/api/admin/custom-requests/stats'),
  ]);

  return {
    requests: res.data ?? [],
    meta: res.meta,
    stats: statsRes.data,
  };
}

export default async function CustomRequestsPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations('admin.customRequests');
  const tBtns = await getTranslations('common.buttons');

  const { requests, meta, stats } = await loadRequests(params);
  const q = params.q ?? '';

  const columns: Column<CustomRequest>[] = [
    {
      key: 'nama',
      header: t('columns.client'),
      render: (r) => (
        <div>
          <p className="font-bold text-ink">{r.nama}</p>
          <p className="text-xs text-ink/60">{r.email} · {r.wa}</p>
        </div>
      ),
    },
    {
      key: 'project',
      header: t('columns.project'),
      render: (r) => (
        <div>
          <span className="font-mono text-xs uppercase bg-surface border border-ink px-1.5 py-0.5 font-bold">
            {r.jenis_proyek}
          </span>
          <p className="text-xs text-ink/70 mt-1 line-clamp-1">{r.deskripsi}</p>
        </div>
      ),
    },
    {
      key: 'budget',
      header: t('columns.budget'),
      render: (r) => (
        <div className="text-xs">
          <p className="font-bold text-primary">{r.budget_range}</p>
          <p className="text-ink/60">{r.timeline}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('columns.status'),
      width: '120px',
      render: (r) => {
        const badgeStatus =
          r.status === 'baru'
            ? 'draft'
            : r.status === 'diproses'
              ? 'aktif'
              : r.status === 'selesai'
                ? 'aktif'
                : 'tidak_dijual';
        return (
          <StatusBadge
            status={badgeStatus}
            labelMap={{
              [badgeStatus]: t(`status.${r.status}`),
            }}
          />
        );
      },
    },
    {
      key: 'created_at',
      header: t('columns.created'),
      width: '130px',
      render: (r) => <span className="text-xs text-ink/60">{formatDate(r.created_at)}</span>,
    },
    {
      key: 'aksi',
      header: t('columns.actions'),
      width: '120px',
      render: (r) => (
        <Button href={`/admin/custom-requests/${r.id}`} variant="ghost" size="sm">
          {tBtns('detail')}
        </Button>
      ),
    },
  ];

  return (
    <AdminListProvider>
      <div className="p-6 sm:p-8 space-y-6">
        <AdminPageHeader
        eyebrow={t('listEyebrow')}
        title={t('listTitle')}
        subtitle={t('listSubtitle')}
      />

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Card variant="surface" hoverable={false} className="p-4">
              <p className="text-xs uppercase font-bold text-ink/60">{t('stats.total')}</p>
              <p className="font-display text-3xl font-black text-ink mt-1">{stats.total}</p>
            </Card>
            <Card variant="surface" hoverable={false} className="p-4">
              <p className="text-xs uppercase font-bold text-ink/60">{t('stats.baru')}</p>
              <p className="font-display text-3xl font-black text-accent mt-1">{stats.baru}</p>
            </Card>
            <Card variant="surface" hoverable={false} className="p-4">
              <p className="text-xs uppercase font-bold text-ink/60">{t('stats.diproses')}</p>
              <p className="font-display text-3xl font-black text-primary mt-1">{stats.diproses}</p>
            </Card>
            <Card variant="surface" hoverable={false} className="p-4">
              <p className="text-xs uppercase font-bold text-ink/60">{t('stats.selesai')}</p>
              <p className="font-display text-3xl font-black text-primary mt-1">{stats.selesai}</p>
            </Card>
            <Card variant="surface" hoverable={false} className="p-4">
              <p className="text-xs uppercase font-bold text-ink/60">{t('stats.dibatalkan')}</p>
              <p className="font-display text-3xl font-black text-ink/40 mt-1">{stats.dibatalkan}</p>
            </Card>
          </div>
        )}

        <AdminTableHeader
          q={q}
          sort="id"
          dir="desc"
          placeholder={t('searchPlaceholder')}
        />

        <DataTableArea
          columnCount={columns.length}
          columnWidths={columns.map((c) => c.width)}
          skeletonCount={10}
        >
          <DataTable
            columns={columns}
            rows={requests}
            rowKey={(r) => r.id}
            emptyState={
              <EmptyState
                title={q ? t('empty.noResults', { query: q }) : t('empty.noneYet')}
                body={q ? t('empty.noResultsHint') : t('empty.noneYetHint')}
              />
            }
          />
        </DataTableArea>

        {meta && meta.last_page > 1 && (
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            basePath="/admin/custom-requests"
            queryParams={{ ...(params.q ? { q: params.q } : {}), ...(params.status ? { status: params.status } : {}) }}
          />
        )}
      </div>
    </AdminListProvider>
  );
}
