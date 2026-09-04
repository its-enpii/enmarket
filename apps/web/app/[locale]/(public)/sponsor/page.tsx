import { getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/public/PageHeader';
import { SectionContainer } from '@/components/public/SectionContainer';
import { buildMetadata } from '@/lib/seo';

import { SponsorWorkspace } from './SponsorWorkspace';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'sponsor' });
  return buildMetadata({ title: t('title') });
}

export default async function SponsorPage() {
  const t = await getTranslations('sponsor');

  return (
    <div>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
      <SectionContainer py="xl">
        <SponsorWorkspace />
      </SectionContainer>
    </div>
  );
}
