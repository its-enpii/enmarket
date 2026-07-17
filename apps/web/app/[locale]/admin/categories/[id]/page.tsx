import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';
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

  const t = await getTranslations('admin.categories');

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
          {t('editEyebrow')}
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
          {category.nama}<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          {t('editSubtitle')}
        </p>
      </header>

      <Card variant="surface" className="p-6 md:p-8 max-w-2xl">
        <CategoryForm
          initial={{
            id: category.id,
            nama: category.nama,
            slug: category.slug,
            deskripsi: category.deskripsi,
          }}
        />
      </Card>
    </div>
  );
}