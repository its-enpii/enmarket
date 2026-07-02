import Link from 'next/link';

import { Button } from '@/components/admin/Button';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Topbar } from '@/components/admin/Topbar';
import { ApiRequestError, apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import {
  LICENSE_STATUS_LABEL,
  type AdminLicenseKey,
  type Category,
  type LicenseStatus,
  type PaginatedResponse,
  type SingleResponse,
} from '@/lib/types';

import { ExtendDialog } from './ExtendDialog';
import { LicenseKeyForm } from './LicenseKeyForm';
import { RevokeButton } from './RevokeButton';

interface Props {
  searchParams: Promise<{
    product_id?: string;
    status?: string;
    q?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: 'License Keys — Admin',
};

async function loadKeys(params: Awaited<Props['searchParams']>) {
  try {
    return await apiGet<PaginatedResponse<AdminLicenseKey>>('/api/admin/license-keys', {
      product_id: params.product_id,
      status: params.status,
      q: params.q,
      page: params.page ?? 1,
      per_page: 20,
    });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } };
    }
    throw err;
  }
}

async function loadProducts() {
  try {
    const res = await apiGet<SingleResponse<Category[]>>('/api/admin/categories');
    // CategoryController returns flat list; kita butuh produk.
    // Pakai /api/admin/products?per_page=100 untuk dropdown sederhana.
    return res.data ?? [];
  } catch {
    return [];
  }
}

async function loadActiveProducts() {
  try {
    const res = await apiGet<{ data: Array<{ id: number; nama: string }> }>(
      '/api/admin/products',
      { status: 'aktif', per_page: 100 },
    );
    return res.data ?? [];
  } catch {
    return [];
  }
}

export default async function LicenseKeysPage({ searchParams }: Props) {
  const params = await searchParams;
  const [keysRes, products] = await Promise.all([loadKeys(params), loadActiveProducts()]);
  // loadProducts unused — keep signature untuk potential extension
  void loadProducts;

  const rows = keysRes.data ?? [];
  const meta = keysRes.meta;

  const columns: Column<AdminLicenseKey>[] = [
    {
      key: 'key',
      header: 'Key',
      width: '260px',
      render: (k) => (
        <code className="text-xs font-mono bg-ink/5 px-2 py-1 border border-ink/20 select-all">
          {k.key}
        </code>
      ),
    },
    {
      key: 'product',
      header: 'Produk',
      render: (k) => (
        <Link
          href={`/admin/products/${k.product_id}`}
          className="font-bold text-primary hover:text-accent underline decoration-2 underline-offset-2"
        >
          {k.product?.nama ?? `Product #${k.product_id}`}
        </Link>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (k) => <StatusBadge status={k.status} labelMap={LICENSE_STATUS_LABEL} />,
    },
    {
      key: 'activated',
      header: 'Aktivasi',
      width: '110px',
      render: (k) => (
        <span className="text-xs text-ink/70">{formatDate(k.activated_at)}</span>
      ),
    },
    {
      key: 'expired',
      header: 'Expired',
      width: '110px',
      render: (k) => (
        <span className="text-xs text-ink/70">{formatDate(k.expired_at)}</span>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      width: '110px',
      render: (k) => (
        <span className="text-xs text-ink/60">{formatDate(k.created_at)}</span>
      ),
    },
    {
      key: 'aksi',
      header: 'Aksi',
      width: '200px',
      render: (k) => {
        const canRevoke = k.status === 'aktif' || k.status === 'digunakan';
        const canExtend = k.status !== 'dicabut';
        return (
          <div className="flex gap-2">
            {canRevoke && (
              <RevokeButton id={k.id} keyMasked={`${k.key.substring(0, 8)}…`} />
            )}
            {canExtend && <ExtendDialog id={k.id} />}
          </div>
        );
      },
    },
  ];

  const STATUS_OPTIONS: { value: LicenseStatus | ''; label: string }[] = [
    { value: '', label: 'Semua Status' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'digunakan', label: 'Digunakan' },
    { value: 'kadaluarsa', label: 'Kadaluarsa' },
    { value: 'dicabut', label: 'Dicabut' },
  ];

  return (
    <>
      <Topbar title="License Keys" subtitle={`${meta.total} key di pool.`} />

      <div className="p-8 space-y-6">
        {/* Filter bar */}
        <form className="flex flex-wrap gap-3 items-end bg-surface border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)]">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="q" className="block text-xs font-bold uppercase tracking-wide mb-1">Cari Key</label>
            <input
              id="q"
              name="q"
              defaultValue={params.q ?? ''}
              placeholder="EPS-XXXX-…"
              className="w-full bg-surface border-2 border-ink px-3 py-2 text-sm font-mono focus:outline-none focus:shadow-[3px_3px_0_0_var(--color-ink)] transition-all"
            />
          </div>

          <div>
            <label htmlFor="product_id" className="block text-xs font-bold uppercase tracking-wide mb-1">Produk</label>
            <select
              id="product_id"
              name="product_id"
              defaultValue={params.product_id ?? ''}
              className="bg-surface border-2 border-ink px-3 py-2 text-sm focus:outline-none focus:shadow-[3px_3px_0_0_var(--color-ink)] transition-all"
            >
              <option value="">Semua Produk</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-xs font-bold uppercase tracking-wide mb-1">Status</label>
            <select
              id="status"
              name="status"
              defaultValue={params.status ?? ''}
              className="bg-surface border-2 border-ink px-3 py-2 text-sm focus:outline-none focus:shadow-[3px_3px_0_0_var(--color-ink)] transition-all"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <Button type="submit" variant="primary" size="sm">Filter</Button>
          <Link href="/admin/license-keys">
            <Button type="button" variant="ghost" size="sm">Reset</Button>
          </Link>
        </form>

        {/* Insert form + table */}
        <LicenseKeyForm products={products} />

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(k) => k.id}
          emptyMessage="Belum ada license key."
        />

        {meta.last_page > 1 && (
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            basePath="/admin/license-keys"
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
    if (queryParams.product_id) sp.set('product_id', queryParams.product_id);
    if (queryParams.status) sp.set('status', queryParams.status);
    if (queryParams.q) sp.set('q', queryParams.q);
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