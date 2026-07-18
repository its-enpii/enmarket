import { getTranslations } from 'next-intl/server';

import { AdminListProvider } from '@/components/admin/AdminListProvider';
import { AdminTableHeader } from '@/components/admin/AdminTableHeader';
import { Button } from '@/components/ui/neobrutal';
import { DataTable, Column } from '@/components/admin/DataTable';
import { DataTableArea } from '@/components/admin/DataTableArea';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { EmptyState } from '@/components/admin/EmptyState';
import { SortableHeader } from '@/components/admin/LiveFilterBar';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { NLink } from '@/components/ui/neobrutal';
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
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.products' });
  return { title: `${t('listTitle')} — Admin` };
}

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
  const t = await getTranslations('admin.products');
  const tBtns = await getTranslations('common.buttons');
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
      header: (
        <SortableHeader field="nama" currentSort={currentSort} currentDir={currentDir}>
          {t('columns.name')}
        </SortableHeader>
      ),
      render: (p) => (
        <NLink href={`/admin/products/${p.id}`} variant="primary" underline="static">
          {p.nama}
        </NLink>
      ),
    },
    {
      key: 'kategori',
      header: t('columns.category'),
      render: (p) => <span className="text-ink/80">{p.category?.nama ?? '—'}</span>,
    },
    {
      key: 'harga',
      header: (
        <SortableHeader field="harga" currentSort={currentSort} currentDir={currentDir}>
          {t('columns.price')}
        </SortableHeader>
      ),
      width: '140px',
      render: (p) => <span className="font-bold">{formatRupiah(p.harga)}</span>,
    },
    {
      key: 'tipe',
      header: t('columns.type'),
      width: '100px',
      render: (p) => <span className="text-xs uppercase font-bold tracking-wide">{TIPE_LABEL[p.tipe] ?? p.tipe}</span>,
    },
    {
      key: 'status',
      header: (
        <SortableHeader field="status" currentSort={currentSort} currentDir={currentDir}>
          {t('columns.status')}
        </SortableHeader>
      ),
      width: '120px',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'updated',
      header: (
        <SortableHeader field="updated_at" currentSort={currentSort} currentDir={currentDir}>
          {t('columns.updated')}
        </SortableHeader>
      ),
      width: '120px',
      render: (p) => <span className="text-ink/60 text-xs">{formatDate(p.updated_at)}</span>,
    },
    {
      key: 'aksi',
      header: t('columns.actions'),
      width: '180px',
      render: (p) => (
        <div className="flex gap-2">
          <Button href={`/admin/products/${p.id}`} variant="ghost" size="sm">
            {tBtns('edit')}
          </Button>
          <DeleteButton itemId={p.id} itemName={p.nama} action={deleteProduct} />
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: 'status',
      label: t('filters.status'),
      options: [
        { value: '', label: t('filters.allStatus') },
        { value: 'aktif', label: t('filters.active') },
        { value: 'draft', label: t('filters.draft') },
        { value: 'tidak_dijual', label: t('filters.notForSale') },
      ],
    },
    {
      key: 'category_id',
      label: t('filters.category'),
      options: [
        { value: '', label: t('filters.allCategory') },
        ...categories.map((c) => ({ value: String(c.id), label: c.nama })),
      ],
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

        <AdminTableHeader
            q={params.q ?? ''}
            sort={currentSort}
            dir={currentDir}
            filters={filters}
            placeholder={t('searchPlaceholder')}
            action={
              <Button href="/admin/products/new" variant="primary" size="md">
                {t('newButton')}
              </Button>
            }
          />

        <DataTableArea
            columnCount={columns.length}
            columnWidths={columns.map((c) => c.width)}
            skeletonCount={meta.per_page ?? 10}
          >
            <DataTable
              columns={columns}
              rows={rows}
              rowKey={(p) => p.id}
              emptyState={
                <EmptyState
                  title={params.q ? t('empty.noResults', { query: params.q }) : t('empty.noneYet')}
                  body={params.q ? t('empty.noResultsHint') : t('empty.noneYetHint')}
                  action={
                    !params.q && (
                      <Button href="/admin/products/new" variant="primary" size="md">
                        {t('newButton')}
                      </Button>
                    )
                  }
                />
              }
            />
          </DataTableArea>

          {meta.last_page > 1 && (
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              basePath="/admin/products"
              queryParams={params}
            />
          )}
        </div>
    </AdminListProvider>
  );
}