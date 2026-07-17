import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';
import { apiGet } from '@/lib/api';
import type { Category, SingleResponse } from '@/lib/types';

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

export default async function NewProductPage() {
  const [categories, t] = await Promise.all([
    loadCategories(),
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
        <ProductForm categories={categories} />
      </Card>
    </div>
  );
}