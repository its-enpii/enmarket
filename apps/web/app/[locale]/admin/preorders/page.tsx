import { getTranslations } from 'next-intl/server';

import { AdminListProvider } from '@/components/admin/AdminListProvider';
import { AdminTableHeader } from '@/components/admin/AdminTableHeader';
import { DataTable, Column } from '@/components/admin/DataTable';
import { DataTableArea } from '@/components/admin/DataTableArea';
import { EmptyState } from '@/components/admin/EmptyState';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { NLink } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import {
  ORDER_STATUS_LABEL,
  type Order,
  type PaginatedResponse,
} from '@/lib/types';

import { ReleaseNowForm } from './ReleaseNowForm';

interface Props {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.preorders' });
  return { title: `${t('listTitle')} — Admin` };
}

async function loadPreorders(params: Awaited<Props['searchParams']>) {
  try {
    return await apiGet<PaginatedResponse<Order>>('/api/admin/preorders', {
      status: params.status ?? 'awaiting',
      q: params.q,
      page: params.page ?? 1,
      per_page: 15,
    });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        data: [],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
      };
    }
    throw err;
  }
}

export default async function PreordersPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations('admin.preorders');
  const ordersRes = await loadPreorders(params);
  const rows = ordersRes.data ?? [];
  const meta = ordersRes.meta;

  const columns: Column<Order>[] = [
    {
      key: 'kode_order',
      header: t('columnCode'),
      width: '180px',
      render: (o) => (
        <NLink href={`/admin/orders/${o.kode_order}`} variant="primary" underline="static">
          {o.kode_order}
        </NLink>
      ),
    },
    {
      key: 'pembeli',
      header: t('columnBuyer'),
      render: (o) => (
        <div>
          <p className="font-bold">{o.nama_pembeli}</p>
          <p className="text-xs text-ink/60">{o.email_pembeli}</p>
        </div>
      ),
    },
    {
      key: 'release',
      header: t('columnRelease'),
      width: '130px',
      render: (o) => (
        <span className="font-mono text-sm">
          {o.preorder_release_date ? formatDate(o.preorder_release_date) : '—'}
        </span>
      ),
    },
    {
      key: 'deposit',
      header: t('columnDeposit'),
      width: '130px',
      render: (o) => (
        <span className="font-bold">
          {o.preorder_deposit_amount
            ? `Rp ${Number(o.preorder_deposit_amount).toLocaleString('id-ID')}`
            : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('columnStatus'),
      width: '130px',
      render: (o) => (
        <StatusBadge status={o.status} labelMap={ORDER_STATUS_LABEL} />
      ),
    },
    {
      key: 'aksi',
      header: t('columnActions'),
      width: '140px',
      render: (o) =>
        o.status === 'preorder_deposit_paid' ? (
          <ReleaseNowForm kodeOrder={o.kode_order} />
        ) : (
          <span className="text-xs text-ink/50 italic">
            {o.preorder_release_processed_at
              ? formatDate(o.preorder_release_processed_at)
              : '—'}
          </span>
        ),
    },
  ];

  const STATUS_OPTIONS = [
    { value: 'awaiting', label: t('filterAwaiting') },
    { value: 'released', label: t('filterReleased') },
    { value: 'all', label: t('filterAll') },
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

        <AdminTableHeader
          q={params.q ?? ''}
          sort="preorder_release_date"
          dir="asc"
          filters={[{ key: 'status', label: t('filterStatusLabel'), options: STATUS_OPTIONS }]}
          placeholder={t('searchPlaceholder')}
        />

        <DataTableArea
          columnCount={columns.length}
          columnWidths={columns.map((c) => c.width)}
          skeletonCount={meta.per_page ?? 15}
        >
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(o) => o.kode_order}
            emptyState={
              <EmptyState
                title={t('emptyNone')}
                body={t('emptyNoneHint')}
              />
            }
          />
        </DataTableArea>

        {meta.last_page > 1 && (
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            basePath="/admin/preorders"
            queryParams={params}
          />
        )}
      </div>
    </AdminListProvider>
  );
}