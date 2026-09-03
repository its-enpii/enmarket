import { getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/public/PageHeader';
import { SectionContainer } from '@/components/public/SectionContainer';
import { SponsorBidForm } from '@/components/public/SponsorBidForm';
import { Card } from '@/components/ui/neobrutal';
import { buildMetadata } from '@/lib/seo';

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
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card variant="surface" className="p-6 md:p-8">
            <h2 className="font-display text-2xl font-black uppercase text-primary mb-6">
              {t('form.title')}
            </h2>
            <SponsorBidForm />
          </Card>

          <aside className="grid content-start gap-6">
            <Card variant="filled-primary" className="p-6">
              <h2 className="font-display text-xl font-black uppercase mb-4">{t('rankingTitle')}</h2>
              <p className="font-body text-body-md text-surface/80">{t('rankingBody')}</p>
            </Card>
            <Card variant="surface" className="p-6">
              <h2 className="font-display text-xl font-black uppercase text-primary mb-4">
                {t('activationTitle')}
              </h2>
              <ol className="grid gap-3">
                {['submit', 'pay', 'activate'].map((step) => (
                  <li key={step} className="border-t-2 border-ink/20 pt-3 font-body text-body-md text-ink/80">
                    {t(`steps.${step}`)}
                  </li>
                ))}
              </ol>
            </Card>
          </aside>
        </div>
      </SectionContainer>
    </div>
  );
}
