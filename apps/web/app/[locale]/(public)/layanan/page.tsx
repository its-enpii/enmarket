import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';
import { PageTitle, SectionIntro } from '@/components/ui';
import { CustomBuildForm } from './CustomBuildForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'customBuild' });
  return {
    ...buildMetadata({
      title: `${t('title')} — enpiistudio`,
      description: t('subtitle'),
    }),
    alternates: { canonical: `/${locale}/layanan` },
  };
}

export default async function LayananPage() {
  const t = await getTranslations('customBuild');

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:py-12 space-y-10">
      {/* Page Header */}
      <div className="border-b-4 border-ink pb-6">
        <SectionIntro eyebrow={t('eyebrow')}>
        <PageTitle size="hero">
          {t('title')}<span className="text-primary">.</span>
        </PageTitle>
        <p className="mt-3 text-base text-ink/70 max-w-3xl leading-relaxed">
          {t('subtitle')}
        </p>
        </SectionIntro>
      </div>

      {/* Intro service overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="surface" hoverable={false} className="p-6">
          <p className="font-label text-2xl mb-2">⚡</p>
          <h3 className="font-bold text-lg text-ink">{t('services.fullstackTitle')}</h3>
          <p className="mt-2 text-xs text-ink/70 leading-relaxed">
            {t('services.fullstackDesc')}
          </p>
        </Card>
        <Card variant="surface" hoverable={false} className="p-6">
          <p className="font-label text-2xl mb-2">📱</p>
          <h3 className="font-bold text-lg text-ink">{t('services.mobileTitle')}</h3>
          <p className="mt-2 text-xs text-ink/70 leading-relaxed">
            {t('services.mobileDesc')}
          </p>
        </Card>
        <Card variant="surface" hoverable={false} className="p-6">
          <p className="font-label text-2xl mb-2">⚙️</p>
          <h3 className="font-bold text-lg text-ink">{t('services.automationTitle')}</h3>
          <p className="mt-2 text-xs text-ink/70 leading-relaxed">
            {t('services.automationDesc')}
          </p>
        </Card>
      </div>

      <div className="border-t-2 border-ink/20 pt-6">
        <Card variant="surface" thick hoverable={false} className="p-6 md:p-10">
          <p className="text-sm font-body text-ink/80 mb-8 max-w-2xl leading-relaxed">
            {t('intro')}
          </p>
          <CustomBuildForm />
        </Card>
      </div>
    </div>
  );
}
import { buildMetadata } from '@/lib/seo';
import { Eyebrow } from '@/components/ui/neobrutal';
