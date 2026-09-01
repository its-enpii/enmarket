import { AdminPageHeader, AdminPageBody } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { AdminListProvider } from '@/components/admin/AdminListProvider';
import { AdminTableHeader } from '@/components/admin/AdminTableHeader';
import { Button } from '@/components/ui/neobrutal';
import { DataTable, Column } from '@/components/admin/DataTable';
import { DataTableArea } from '@/components/admin/DataTableArea';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { EmptyState } from '@/components/admin/EmptyState';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Category, SingleResponse } from '@/lib/types';

import { deleteCategory } from './actions';

interface Props {
  searchParams: Promise<{ q?: string }>;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.categories' });
  return buildMetadata({
    title: `${t('listTitle')} — Admin`,
  });
}

async function loadCategories() {
  const res = await apiGet<SingleResponse<Category[]>>('/api/admin/categories');
  return res.data ?? [];
}

export default async function CategoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations('admin.categories');
  const tBtns = await getTranslations('common.buttons');
  const all = await loadCategories();

  // Filter client-side (backend tidak support q di /api/admin/categories).
  // Cocok untuk kategori karena jumlah row kecil.
  const q = (params.q ?? '').trim().toLowerCase();
  const categories = q
    ? all.filter(
        (c) =>
          c.nama.toLowerCase().includes(q) ||
          (c.slug ?? '').toLowerCase().includes(q),
      )
    : all;

  const columns: Column<Category>[] = [
    { key: 'nama', header: t('columns.name'), render: (c) => <span className="font-bold">{c.nama}</span> },
    { key: 'slug', header: t('columns.slug'), render: (c) => <code className="text-xs bg-surface border-2 border-ink px-2 py-0.5">{c.slug}</code> },
    {
      key: 'produk',
      header: t('columns.products'),
      width: '100px',
      render: (c) => <span>{c.products_count ?? 0}</span>,
    },
    {
      key: 'dibuat',
      header: t('columns.created'),
      width: '140px',
      render: (c) => <span className="text-ink/60 text-xs">{formatDate(c.created_at)}</span>,
    },
    {
      key: 'aksi',
      header: t('columns.actions'),
      width: '200px',
      render: (c) => {
        const count = c.products_count ?? 0;
        return (
          <div className="flex gap-2">
            <Button href={`/admin/categories/${c.id}`} variant="ghost" size="sm">
              {tBtns('edit')}
            </Button>
            <DeleteButton
              itemId={c.id}
              itemName={c.nama}
              confirmMessage={
                count > 0
                  ? t('delete.withProducts', { name: c.nama, count })
                  : t('delete.noProducts', { name: c.nama })
              }
              action={deleteCategory}
            />
          </div>
        );
      },
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

        <AdminTableHeader
          q={params.q ?? ''}
          sort="id"
          dir="asc"
          placeholder={t('searchPlaceholder')}
          action={
            <Button href="/admin/categories/new" variant="primary" size="md">
              {t('newButton')}
            </Button>
          }
        />

          <DataTableArea
            columnCount={columns.length}
            columnWidths={columns.map((c) => c.width)}
            skeletonCount={10}
          >
            <DataTable
              columns={columns}
              rows={categories}
              rowKey={(c) => c.id}
              emptyState={
                <EmptyState
                  title={q ? t('empty.noResults', { query: q }) : t('empty.noneYet')}
                  body={q ? t('empty.noResultsHint') : t('empty.noneYetHint')}
                  action={
                    !q && (
                      <Button href="/admin/categories/new" variant="primary" size="md">
                        {t('newButton')}
                      </Button>
                    )
                  }
                />
              }
            />
          </DataTableArea>
      </AdminPageBody>
    </AdminListProvider>
  );
}
