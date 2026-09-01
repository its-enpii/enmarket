import { AdminPageHeader, AdminPageBody } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';
import { apiGet } from '@/lib/api';
import { ADMIN_LIST_PER_PAGE } from '@/lib/constants';
import type { Category, LinkedPost, PaginatedResponse, SingleResponse } from '@/lib/types';

import { ProductForm } from '../ProductForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.products' });
  return buildMetadata({
    title: `${t('newTitle')} — Admin`,
  });
}

async function loadCategories() {
  try {
    const res = await apiGet<SingleResponse<Category[]>>('/api/admin/categories');
    return res.data ?? [];
  } catch {
    return [];
  }
}

/**
 * Daftar published posts yang tersedia untuk di-link ke produk.
 * Filter ke published saja + sort by updated_at desc biar fresh post di atas.
 */
async function loadAvailablePosts(): Promise<LinkedPost[]> {
  try {
    const res = await apiGet<PaginatedResponse<{
      id: number;
      slug: string;
      title: string;
      excerpt: string | null;
      thumbnail: string | null;
    }>>('/api/admin/posts', { status: 'published', per_page: ADMIN_LIST_PER_PAGE });
    return res.data ?? [];
  } catch {
    return [];
  }
}

export default async function NewProductPage() {
  const [categories, availablePosts, t] = await Promise.all([
    loadCategories(),
    loadAvailablePosts(),
    getTranslations('admin.products'),
  ]);

  return (
    <AdminPageBody>
      <AdminPageHeader
        eyebrow={t('listEyebrow')}
        title={t('newTitle')}
        subtitle={t('newSubtitle')}
      />

      <Card variant="surface" className="p-6 md:p-8">
        <ProductForm categories={categories} availablePosts={availablePosts} />
      </Card>
    </AdminPageBody>
  );
}
