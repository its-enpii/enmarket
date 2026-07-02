import Link from 'next/link';

import { Button } from '@/components/admin/Button';
import { DataTable, Column } from '@/components/admin/DataTable';
import { LiveFilterBar } from '@/components/admin/LiveFilterBar';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Topbar } from '@/components/admin/Topbar';
import { ApiRequestError, apiGet } from '@/lib/api';
import { formatDateTime, formatRupiah } from '@/lib/format';
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
}

export const metadata = {
  title: 'Pesanan — Admin',
};

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
  const ordersRes = await loadOrders(params);
  const rows = ordersRes.data ?? [];
  const meta = ordersRes.meta;

  const columns: Column<Order>[] = [
    {
      key: 'kode_order',
      header: 'Kode',
      width: '180px',
      render: (o) => (
        <Link
          href={`/admin/orders/${o.kode_order}`}
          className="font-bold text-primary hover:text-accent underline decoration-2 underline-offset-2"
        >
          {o.kode_order}
        </Link>
      ),
    },
    {
      key: 'pembeli',
      header: 'Pembeli',
      render: (o) => (
        <div>
          <p className="font-bold">{o.nama_pembeli}</p>
          <p className="text-xs text-ink/60">{o.email_pembeli}</p>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      width: '140px',
      render: (o) => <span className="font-bold">{o.total_harga_formatted}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (o) => (
        <StatusBadge status={o.status} labelMap={ORDER_STATUS_LABEL} />
      ),
    },
    {
      key: 'tanggal',
      header: 'Tanggal',
      width: '140px',
      render: (o) => (
        <span className="text-ink/60 text-xs">{formatDateTime(o.created_at)}</span>
      ),
    },
    {
      key: 'aksi',
      header: 'Aksi',
      width: '100px',
      render: (o) => (
        <Link href={`/admin/orders/${o.kode_order}`}>
          <Button variant="ghost" size="sm">Lihat</Button>
        </Link>
      ),
    },
  ];

  const STATUS_OPTIONS = [
    { value: '', label: 'Semua Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'expired', label: 'Expired' },
    { value: 'refunded', label: 'Refunded' },
  ];

  return (
    <>
      <Topbar title="Pesanan" subtitle={`${meta.total} pesanan terdaftar.`} />

      <div className="p-6 sm:p-8 space-y-6">
        <LiveFilterBar
          q={params.q ?? ''}
          sort={params.sort ?? 'created_at'}
          dir={params.dir === 'asc' ? 'asc' : 'desc'}
          filters={[{ key: 'status', label: 'Status', options: STATUS_OPTIONS }]}
          passthrough={{
            ...(params.date_from ? { date_from: params.date_from } : {}),
            ...(params.date_to ? { date_to: params.date_to } : {}),
          }}
          placeholder="Cari kode / nama / email…"
        />

        {/* Date range — di luar LiveFilterBar (rarely used, keep visible) */}
        <form className="flex flex-wrap gap-3 items-end bg-surface border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)]">
          <div>
            <label htmlFor="date_from" className="block text-xs font-bold uppercase tracking-wide mb-1">Dari</label>
            <input
              id="date_from"
              name="date_from"
              type="date"
              defaultValue={params.date_from ?? ''}
              className="bg-surface border-2 border-ink px-3 py-2 text-sm focus:outline-none focus:shadow-[3px_3px_0_0_var(--color-ink)] transition-all"
            />
          </div>
          <div>
            <label htmlFor="date_to" className="block text-xs font-bold uppercase tracking-wide mb-1">Sampai</label>
            <input
              id="date_to"
              name="date_to"
              type="date"
              defaultValue={params.date_to ?? ''}
              className="bg-surface border-2 border-ink px-3 py-2 text-sm focus:outline-none focus:shadow-[3px_3px_0_0_var(--color-ink)] transition-all"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">Filter Tanggal</Button>
        </form>

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(o) => o.kode_order}
          emptyMessage="Belum ada pesanan."
        />

        {meta.last_page > 1 && (
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            basePath="/admin/orders"
            queryParams={params}
          />
        )}
      </div>
    </>
  );
}

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  basePath: string;
  queryParams: Awaited<Props['searchParams']>;
}

function Pagination({ currentPage, lastPage, basePath, queryParams }: PaginationProps) {
  function pageHref(p: number) {
    const sp = new URLSearchParams();
    if (queryParams.status) sp.set('status', queryParams.status);
    if (queryParams.q) sp.set('q', queryParams.q);
    if (queryParams.date_from) sp.set('date_from', queryParams.date_from);
    if (queryParams.date_to) sp.set('date_to', queryParams.date_to);
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const pages: (number | '…')[] = [];
  for (let p = 1; p <= lastPage; p++) {
    if (p === 1 || p === lastPage || Math.abs(p - currentPage) <= 2) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {currentPage > 1 && (
        <Link href={pageHref(currentPage - 1)}>
          <Button variant="ghost" size="sm">← Prev</Button>
        </Link>
      )}
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-2 py-1.5 text-ink/60">…</span>
        ) : p === currentPage ? (
          <span
            key={p}
            className="px-3 py-1.5 bg-primary text-surface border-2 border-ink text-sm font-bold shadow-[2px_2px_0_0_var(--color-ink)]"
          >
            {p}
          </span>
        ) : (
          <Link key={p} href={pageHref(p)}>
            <Button variant="ghost" size="sm">{p}</Button>
          </Link>
        ),
      )}
      {currentPage < lastPage && (
        <Link href={pageHref(currentPage + 1)}>
          <Button variant="ghost" size="sm">Next →</Button>
        </Link>
      )}
    </div>
  );
}