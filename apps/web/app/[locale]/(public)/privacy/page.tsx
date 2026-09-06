import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPage } from '@/components/public/LegalPage';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  return {
    ...buildMetadata({ title: t('metaTitle'), description: t('metaDescription') }),
    alternates: { canonical: `/${locale}/privacy` },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  type Sec = { heading: string; paragraphs: string[] };
  const raw = (await import(`../../../../messages/${locale === 'en' ? 'en' : 'id'}.json`)).default as {
    privacy: { sections: Sec[] };
  };

  return (
    <LegalPage
      eyebrow={t('eyebrow')}
      title={t('title')}
      subtitle={t('subtitle')}
      updated={t('updated', { date: new Date().toISOString().slice(0, 10) })}
      tocLabel={t('tocLabel')}
      backHref="/"
      backLabel={t('backLinkText')}
      crossHref="/terms"
      crossLabel={locale === 'id' ? 'Syarat & Ketentuan' : 'Terms & Conditions'}
      sections={raw.privacy.sections}
    />
  );
}
