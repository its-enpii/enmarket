import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPage } from '@/components/public/LegalPage';
import { siteMetadata } from '@/lib/seo';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });
  return siteMetadata(locale, 'terms', {
    title: t('metaTitle'),
    description: t('metaDescription'),
  });
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });
  type Sec = { heading: string; paragraphs: string[] };
  const raw = (await import(`../../../../messages/${locale === 'en' ? 'en' : 'id'}.json`)).default as {
    terms: { sections: Sec[] };
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
      crossHref="/privacy"
      crossLabel={locale === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}
      sections={raw.terms.sections}
    />
  );
}
