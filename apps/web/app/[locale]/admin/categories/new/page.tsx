import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';

import { CategoryForm } from '../CategoryForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.categories' });
  return { title: `${t('newTitle')} — Admin` };
}

export default async function NewCategoryPage() {
  const t = await getTranslations('admin.categories');
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

      <Card variant="surface" className="p-6 md:p-8 max-w-2xl">
        <CategoryForm />
      </Card>
    </div>
  );
}