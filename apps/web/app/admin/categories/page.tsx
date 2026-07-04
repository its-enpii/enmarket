import Link from 'next/link';

import { AdminListProvider } from '@/components/admin/AdminListProvider';
import { AdminTableHeader } from '@/components/admin/AdminTableHeader';
import { Button } from '@/components/admin/Button';
import { DataTable, Column } from '@/components/admin/DataTable';
import { DataTableArea } from '@/components/admin/DataTableArea';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Category, SingleResponse } from '@/lib/types';

import { deleteCategory } from './actions';

export const metadata = {
  title: 'Kategori — Admin',
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

async function loadCategories() {
  const res = await apiGet<SingleResponse<Category[]>>('/api/admin/categories');
  return res.data ?? [];
}

export default async function CategoriesPage({ searchParams }: Props) {
  const params = await searchParams;
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
    { key: 'nama', header: 'Nama', render: (c) => <span className="font-bold">{c.nama}</span> },
    { key: 'slug', header: 'Slug', render: (c) => <code className="text-xs bg-surface border-2 border-ink px-2 py-0.5">{c.slug}</code> },
    {
      key: 'produk',
      header: 'Produk',
      width: '100px',
      render: (c) => <span>{c.products_count ?? 0}</span>,
    },
    {
      key: 'dibuat',
      header: 'Dibuat',
      width: '140px',
      render: (c) => <span className="text-ink/60 text-xs">{formatDate(c.created_at)}</span>,
    },
    {
      key: 'aksi',
      header: 'Aksi',
      width: '200px',
      render: (c) => (
        <div className="flex gap-2">
          <Link href={`/admin/categories/${c.id}`}>
            <Button variant="ghost" size="sm">Edit</Button>
          </Link>
          <DeleteButton
            itemId={c.id}
            itemName={c.nama}
            confirmMessage={
              (c.products_count ?? 0) > 0
                ? `Kategori "${c.nama}" masih punya ${c.products_count} produk. Hapus kategori akan GAGAL. Lanjutkan?`
                : `Hapus kategori "${c.nama}"?`
            }
            action={deleteCategory}
          />
        </div>
      ),
    },
  ];

  return (
    <AdminListProvider>
      <div className="p-6 sm:p-8 space-y-6">
          <AdminTableHeader
            q={params.q ?? ''}
            sort="id"
            dir="asc"
            placeholder="Cari nama atau slug…"
            action={
              <Link href="/admin/categories/new">
                <Button variant="primary" size="md" flat>+ Kategori Baru</Button>
              </Link>
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
              emptyMessage={
                q
                  ? `Tidak ada kategori yang cocok dengan "${q}".`
                  : 'Belum ada kategori. Tambah satu untuk mulai.'
              }
            />
          </DataTableArea>
      </div>
    </AdminListProvider>
  );
}