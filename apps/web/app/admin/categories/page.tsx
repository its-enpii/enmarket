import Link from 'next/link';

import { Button } from '@/components/admin/Button';
import { DataTable, Column } from '@/components/admin/DataTable';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { Topbar } from '@/components/admin/Topbar';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Category, SingleResponse } from '@/lib/types';

import { deleteCategory } from './actions';

export const metadata = {
  title: 'Kategori — Admin',
};

async function loadCategories() {
  const res = await apiGet<SingleResponse<Category[]>>('/api/admin/categories');
  return res.data ?? [];
}

export default async function CategoriesPage() {
  const categories = await loadCategories();

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
    <>
      <Topbar
        title="Kategori"
        subtitle={`${categories.length} kategori terdaftar.`}
      />

      <div className="p-8 space-y-6">
        <div className="flex justify-end">
          <Link href="/admin/categories/new">
            <Button variant="primary">+ Kategori Baru</Button>
          </Link>
        </div>

        <DataTable
          columns={columns}
          rows={categories}
          rowKey={(c) => c.id}
          emptyMessage="Belum ada kategori. Tambah satu untuk mulai."
        />
      </div>
    </>
  );
}