import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { SectionContainer } from '@/components/public/SectionContainer';
import { Card, Button } from '@/components/ui/neobrutal';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'topup' });
  return buildMetadata({
    title: t('failedTitle'),
  });
}

export default async function TopupFailedPage() {
  const t = await getTranslations('topup');

  return (
    <div className="bg-transparent py-16 md:py-24">
      <SectionContainer>
        <div className="max-w-lg mx-auto text-center">
          <Card variant="surface" hoverable={false} className="p-8">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="font-display text-3xl font-black text-ink mb-3">{t('failedTitle')}</h1>
            <p className="font-body text-body-md text-ink/70 mb-6">{t('failedMessage')}</p>
            <Button variant="primary" size="md" href="/topup">
              {t('backToGames')}
            </Button>
          </Card>
        </div>
      </SectionContainer>
    </div>
  );
}
