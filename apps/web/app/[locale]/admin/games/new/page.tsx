import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';

import { GameForm } from '../GameForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.games' });
  return buildMetadata({
    title: `${t('newTitle')} — Admin`,
  });
}

export default async function NewGamePage() {
  const t = await getTranslations('admin.games');

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <AdminPageHeader
        eyebrow={t('listEyebrow')}
        title={t('newTitle')}
        subtitle={t('newSubtitle')}
      />

      <Card variant="surface" className="p-6 md:p-8">
        <GameForm />
      </Card>
    </div>
  );
}
