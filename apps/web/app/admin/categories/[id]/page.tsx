import { notFound } from 'next/navigation';

import { Topbar } from '@/components/admin/Topbar';
import { ApiRequestError, apiGet } from '@/lib/api';
import type { Category, SingleResponse } from '@/lib/types';

import { CategoryForm } from '../CategoryForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;

  let category: Category | null = null;
  try {
    const res = await apiGet<SingleResponse<Category>>(`/api/admin/categories/${id}`);
    category = res.data;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  if (!category) notFound();

  return (
    <>
      <Topbar title={`Edit: ${category.nama}`} subtitle={`Slug: ${category.slug}`} />

      <div className="p-8 max-w-2xl">
        <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)]">
          <CategoryForm
            initial={{
              id: category.id,
              nama: category.nama,
              slug: category.slug,
              deskripsi: category.deskripsi,
            }}
          />
        </div>
      </div>
    </>
  );
}