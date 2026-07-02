import Link from 'next/link';

import { Button } from '@/components/admin/Button';
import { DataTable, Column } from '@/components/admin/DataTable';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { LiveFilterBar } from '@/components/admin/LiveFilterBar';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Topbar } from '@/components/admin/Topbar';
import { ApiRequestError, apiGet } from '@/lib/api';
import { TIPE_LABEL, formatDate, formatRupiah } from '@/lib/format';
import type {
  Category,
  PaginatedResponse,
  Product,
  SingleResponse,
} from '@/lib/types';

import { deleteProduct } from './actions';

interface Props {
  searchParams: Promise<{
    status?: string;
    category_id?: string;
    q?: string;
    page?: string;
    sort?: string;
    dir?: 'asc' | 'desc';
  }>;
}

export const metadata = {
  title: 'Produk — Admin',
};

async function loadProducts(params: Awaited<Props['searchParams']>) {
  try {
    return await apiGet<PaginatedResponse<Product>>('/api/admin/products', {
      status: params.status,
      category_id: params.category_id,
      q: params.q,
      sort: params.sort,
      dir: params.dir,
      page: params.page ?? 1,
      per_page: 10,
    });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } };
    }
    throw err;
  }
}

async function loadCategories() {
  try {
    const res = await apiGet<SingleResponse<Category[]>>('/api/admin/categories');
    return res.data ?? [];
  } catch {
    return [];
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const [productsRes, categories] = await Promise.all([
    loadProducts(params),
    loadCategories(),
  ]);

  const rows = productsRes.data ?? [];
  const meta = productsRes.meta;
  const currentSort = params.sort ?? 'updated_at';
  const currentDir: 'asc' | 'desc' = params.dir === 'asc' ? 'asc' : 'desc';

  const columns: Column<Product>[] = [
    {
      key: 'nama',
      header: 'Nama',
      render: (p) => (
        <Link
          href={`/admin/products/${p.id}`}
          className="font-bold text-primary hover:text-accent underline decoration-2 underline-offset-2"
        >
          {p.nama}
        </Link>
      ),
    },
    {
      key: 'kategori',
      header: 'Kategori',
      render: (p) => <span className="text-ink/80">{p.category?.nama ?? '—'}</span>,
    },
    {
      key: 'harga',
      header: 'Harga',
      width: '140px',
      render: (p) => <span className="font-bold">{formatRupiah(p.harga)}</span>,
    },
    {
      key: 'tipe',
      header: 'Tipe',
      width: '100px',
      render: (p) => <span className="text-xs uppercase font-bold tracking-wide">{TIPE_LABEL[p.tipe] ?? p.tipe}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'updated',
      header: 'Update',
      width: '120px',
      render: (p) => <span className="text-ink/60 text-xs">{formatDate(p.updated_at)}</span>,
    },
    {
      key: 'aksi',
      header: 'Aksi',
      width: '180px',
      render: (p) => (
        <div className="flex gap-2">
          <Link href={`/admin/products/${p.id}`}>
            <Button variant="ghost" size="sm">Edit</Button>
          </Link>
          <DeleteButton itemId={p.id} itemName={p.nama} action={deleteProduct} />
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: '', label: 'Semua Status' },
        { value: 'aktif', label: 'Aktif' },
        { value: 'draft', label: 'Draft' },
        { value: 'tidak_dijual', label: 'Tidak Dijual' },
      ],
    },
    {
      key: 'category_id',
      label: 'Kategori',
      options: [
        { value: '', label: 'Semua Kategori' },
        ...categories.map((c) => ({ value: String(c.id), label: c.nama })),
      ],
    },
  ];

  return (
    <>
      <Topbar title="Produk" subtitle={`${meta.total} produk terdaftar.`} />

      <div className="p-6 sm:p-8 space-y-6">
        {/* Header action bar */}
        <div className="flex items-center justify-between gap-3">
          <LiveFilterBar
            q={params.q ?? ''}
            sort={currentSort}
            dir={currentDir}
            filters={filters}
            placeholder="Cari nama atau slug…"
          />
          <Link href="/admin/products/new" className="shrink-0">
            <Button variant="primary" size="sm">+ Produk Baru</Button>
          </Link>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(p) => p.id}
          emptyMessage="Belum ada produk. Tambah satu."
        />

        {meta.last_page > 1 && (
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            basePath="/admin/products"
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
    if (queryParams.category_id) sp.set('category_id', queryParams.category_id);
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