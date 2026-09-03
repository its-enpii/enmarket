import { AdminPageHeader, AdminPageBody, StatTile } from '@/components/ui';
import { Text } from '@/components/ui';
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
          <Text>{r.email} · {r.wa}</Text>
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
      render: (r) => <Text as="span" variant="muted">{formatDate(r.created_at)}</Text>,
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
      <AdminPageBody>
        <AdminPageHeader
        eyebrow={t('listEyebrow')}
        title={t('listTitle')}
        subtitle={t('listSubtitle')}
      />

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <StatTile label={t('stats.total')} value={stats.total} variant="surface" valueClassName="text-ink" />
            <StatTile label={t('stats.baru')} value={stats.baru} variant="surface" valueClassName="text-accent" />
            <StatTile label={t('stats.diproses')} value={stats.diproses} variant="surface" valueClassName="text-primary" />
            <StatTile label={t('stats.selesai')} value={stats.selesai} variant="surface" valueClassName="text-primary" />
            <StatTile label={t('stats.dibatalkan')} value={stats.dibatalkan} variant="surface" valueClassName="text-ink/40" />
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
      </AdminPageBody>
    </AdminListProvider>
  );
}
