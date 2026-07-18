import { getTranslations } from 'next-intl/server';

import { AdminListProvider } from '@/components/admin/AdminListProvider';
import { AdminTableHeader } from '@/components/admin/AdminTableHeader';
import { Button } from '@/components/ui/neobrutal';
import { DataTable, Column } from '@/components/admin/DataTable';
import { DataTableArea } from '@/components/admin/DataTableArea';
import { EmptyState } from '@/components/admin/EmptyState';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { NLink } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import {
  ORDER_STATUS_LABEL,
  type Order,
  type PaginatedResponse,
} from '@/lib/types';

interface Props {
  searchParams: Promise<{
    status?: string;
    q?: string;
    date_from?: string;
    date_to?: string;
    page?: string;
    sort?: string;
    dir?: 'asc' | 'desc';
  }>;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.orders' });
  return { title: `${t('listTitle')} — Admin` };
}

async function loadOrders(params: Awaited<Props['searchParams']>) {
  try {
    return await apiGet<PaginatedResponse<Order>>('/api/admin/orders', {
      status: params.status,
      q: params.q,
      date_from: params.date_from,
      date_to: params.date_to,
      sort: params.sort,
      dir: params.dir,
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

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations('admin.orders');
  const ordersRes = await loadOrders(params);
  const rows = ordersRes.data ?? [];
  const meta = ordersRes.meta;

  const columns: Column<Order>[] = [
    {
      key: 'kode_order',
      header: t('columns.code'),
      width: '180px',
      render: (o) => (
        <NLink href={`/admin/orders/${o.kode_order}`} variant="primary" underline="static">
          {o.kode_order}
        </NLink>
      ),
    },
    {
      key: 'pembeli',
      header: t('columns.buyer'),
      render: (o) => (
        <div>
          <p className="font-bold">{o.nama_pembeli}</p>
          <p className="text-xs text-ink/60">{o.email_pembeli}</p>
        </div>
      ),
    },
    {
      key: 'total',
      header: t('columns.total'),
      width: '140px',
      render: (o) => <span className="font-bold">{o.total_harga_formatted}</span>,
    },
    {
      key: 'status',
      header: t('columns.status'),
      width: '120px',
      render: (o) => (
        <StatusBadge status={o.status} labelMap={ORDER_STATUS_LABEL} />
      ),
    },
    {
      key: 'tanggal',
      header: t('columns.date'),
      width: '140px',
      render: (o) => (
        <span className="text-ink/60 text-xs">{formatDateTime(o.created_at)}</span>
      ),
    },
    {
      key: 'aksi',
      header: t('columns.actions'),
      width: '100px',
      render: (o) => (
        <Button href={`/admin/orders/${o.kode_order}`} variant="ghost" size="sm">
          {t('viewAction')}
        </Button>
      ),
    },
  ];

  const STATUS_OPTIONS = [
    { value: '', label: t('filterStatusAll') },
    { value: 'pending', label: t('filterStatusPending') },
    { value: 'paid', label: t('filterStatusPaid') },
    { value: 'failed', label: t('filterStatusFailed') },
    { value: 'expired', label: t('filterStatusExpired') },
    { value: 'refunded', label: t('filterStatusRefunded') },
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
            sort={params.sort ?? 'created_at'}
            dir={params.dir === 'asc' ? 'asc' : 'desc'}
            filters={[{ key: 'status', label: t('filterStatusLabel'), options: STATUS_OPTIONS }]}
            placeholder={t('searchPlaceholder')}
            dateRange={{ from: params.date_from, to: params.date_to }}
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
                  title={params.q || params.status ? t('empty.noMatch') : t('empty.noneYet')}
                  body={params.q || params.status ? t('empty.noMatchHint') : t('empty.noneYetHint')}
                />
              }
            />
          </DataTableArea>

          {meta.last_page > 1 && (
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              basePath="/admin/orders"
              queryParams={params}
            />
          )}
      </div>
    </AdminListProvider>
  );
}