import { AdminPageHeader, AdminPageBody } from '@/components/ui';
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
    <AdminPageBody>
      <AdminPageHeader
        eyebrow={t('editEyebrow')}
        title={category.nama}
        subtitle={t('editSubtitle')}
      />

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
    </AdminPageBody>
  );
}
