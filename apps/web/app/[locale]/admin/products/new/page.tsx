import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';
import { apiGet } from '@/lib/api';
import type { Category, LinkedPost, PaginatedResponse, SingleResponse } from '@/lib/types';

import { ProductForm } from '../ProductForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.products' });
  return { title: `${t('newTitle')} — Admin` };
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
    }>>('/api/admin/posts', { status: 'published', per_page: 100 });
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
    <div className="p-6 sm:p-8 space-y-6">
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
          {t('listEyebrow')}
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
          {t('newTitle')}<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          {t('newSubtitle')}
        </p>
      </header>

      <Card variant="surface" className="p-6 md:p-8">
        <ProductForm categories={categories} availablePosts={availablePosts} />
      </Card>
    </div>
  );
}