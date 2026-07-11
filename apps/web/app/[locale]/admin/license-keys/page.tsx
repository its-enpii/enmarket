import Link from 'next/link';

import { AdminListProvider } from '@/components/admin/AdminListProvider';
import { AdminTableHeader } from '@/components/admin/AdminTableHeader';
import { Button } from '@/components/admin/Button';
import { DataTable, Column } from '@/components/admin/DataTable';
import { DataTableArea } from '@/components/admin/DataTableArea';
import { EmptyState } from '@/components/admin/EmptyState';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
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
import { LicenseKeyFormCard, LicenseKeyTrigger } from './LicenseKeyForm';
import { LicenseKeyProvider } from './LicenseKeyContext';
import { RevokeButton } from './RevokeButton';

interface Props {
  searchParams: Promise<{
    product_id?: string;
    status?: string;
    q?: string;
    page?: string;
    sort?: string;
    dir?: 'asc' | 'desc';
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
      sort: params.sort,
      dir: params.dir,
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
        <span className="text-xs text-ink/60">{formatDate(k.activated_at)}</span>
      ),
    },
    {
      key: 'expired',
      header: 'Expired',
      width: '110px',
      render: (k) => (
        <span className="text-xs text-ink/60">{formatDate(k.expired_at)}</span>
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
    <AdminListProvider>
      <LicenseKeyProvider>
        <div className="p-6 sm:p-8 space-y-6">
          <header className="border-b-4 border-ink pb-6">
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
              ✎ Studio / Lisensi
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
              License Keys<span className="text-primary">.</span>
            </h1>
            <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
              Semua kunci lisensi yang diterbitkan. Bisa dicabut, diperpanjang
              masa berlakunya, atau digenerate massal dari sini.
            </p>
          </header>

          <AdminTableHeader
            q={params.q ?? ''}
            sort={params.sort ?? 'id'}
            dir={params.dir === 'asc' ? 'asc' : 'desc'}
            filters={[
              {
                key: 'product_id',
                label: 'Produk',
                options: [
                  { value: '', label: 'Semua Produk' },
                  ...products.map((p) => ({ value: String(p.id), label: p.nama })),
                ],
              },
              { key: 'status', label: 'Status', options: STATUS_OPTIONS },
            ]}
            placeholder="EPS-XXXX-…"
            action={<LicenseKeyTrigger products={products} />}
            secondary={<LicenseKeyFormCard products={products} />}
          />

          <DataTableArea
            columnCount={columns.length}
            columnWidths={columns.map((c) => c.width)}
            skeletonCount={meta.per_page ?? 20}
          >
            <DataTable
              columns={columns}
              rows={rows}
              rowKey={(k) => k.id}
              emptyState={
                <EmptyState
                  title={params.q || params.status || params.product_id ? 'Tidak ada license key yang cocok' : 'Belum ada license key'}
                  body={params.q || params.status || params.product_id ? 'Coba ubah filter atau hapus pencarian.' : 'Generate license key pertama lewat form di atas.'}
                />
              }
            />
          </DataTableArea>

          {meta.last_page > 1 && (
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              basePath="/admin/license-keys"
              queryParams={params}
            />
          )}
      </div>
      </LicenseKeyProvider>
    </AdminListProvider>
  );
}