/**
 * Discover — enpiistudio about / manifesto page.
 *
 * Server component; ambil strings via getTranslations({ locale, namespace }).
 */

import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { Button, NLink } from '@/components/ui/neobrutal';
import { PageHeader } from '@/components/public/PageHeader';
import { SectionContainer } from '@/components/public/SectionContainer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'discover' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: { canonical: `/${locale}/discover` },
  };
}

// Process stamps tetap bahasa Inggris (marka brand).
const VALUES = [
  'Self-taught',
  'Full-stack',
  'Detail-obsessed',
  'Solo by choice',
  'Source-first',
  'Anti-trend',
  'Slow-burn',
] as const;

export default async function DiscoverPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  unstable_setRequestLocale(locale);
  const t = await getTranslations('discover');

  // Pillars content — translated per locale via namespace.
  const PILLARS = [
    {
      icon: '◇',
      iconBg: 'bg-primary',
      iconText: 'text-surface',
      titleKey: 'pillarDiscoverTitle' as const,
      bodyKey: 'pillarDiscoverBody' as const,
    },
    {
      icon: '⟨⟩',
      iconBg: 'bg-accent',
      iconText: 'text-ink',
      titleKey: 'pillarDevelopTitle' as const,
      bodyKey: 'pillarDevelopBody' as const,
    },
    {
      icon: '☷',
      iconBg: 'bg-ink',
      iconText: 'text-surface',
      titleKey: 'pillarDisplayTitle' as const,
      bodyKey: 'pillarDisplayBody' as const,
    },
  ];

  return (
    <>
      {/* ───── 1. HERO ───── */}
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        subtitle={t('subtitle')}
      />

      {/* ───── 2. STORY ───── */}
      <section className="border-b-4 border-ink bg-surface">
        <SectionContainer py="xl" className="grid grid-cols-1 lg:grid-cols-[5fr_4fr] gap-10 lg:gap-16 items-start">
          {/* Pull-quote — kolom kiri, dominant. Frasa studio identity (EN),
              dibungkus span dengan background color + hard shadow Neobrutalism. */}
          <blockquote className="font-display text-2xl sm:text-3xl md:text-5xl font-black uppercase leading-[1.05] tracking-tight text-ink break-words">
            <span className="text-primary">“</span>
            Code is a{' '}
            <span className="inline-block bg-primary text-surface px-2 py-0.5 border-2 border-ink shadow-[4px_4px_0_0_var(--color-accent)]">
              material
            </span>
            , not a delivery{' '}
            <span className="inline-block bg-accent text-ink px-2 py-0.5 border-2 border-ink shadow-[4px_4px_0_0_var(--color-primary)]">
              mechanism
            </span>
            .
            <span className="text-primary">”</span>
          </blockquote>
          <div className="space-y-6 font-body text-body-md text-ink/80 lg:pt-4">
            <p>{t('storyBody1')}</p>
            <p>{t('storyBody2')}</p>
            <p>{t('storyBody3')}</p>
            <p className="font-label text-label-sm uppercase tracking-[0.2em] text-accent pt-2">
              {t('signature')}
            </p>
          </div>
        </SectionContainer>
      </section>

      {/* ───── 3. PILLARS ───── */}
      <section className="border-b-4 border-ink">
        <SectionContainer py="lg">
          <div className="mb-12 max-w-2xl">
            <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-3">
              {t('pillarsHeading')}
            </p>
            <h2 className="font-display text-headline-lg-mobile md:text-headline-lg font-extrabold uppercase tracking-tight text-ink">
              {t('pillarsTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 border-4 border-ink shadow-[8px_8px_0_0_var(--color-ink)]">
            {PILLARS.map((pillar, i) => (
              <article
                key={pillar.titleKey}
                className={[
                  'bg-surface p-8 md:p-10 flex flex-col gap-5',
                  i > 0 ? 'border-t-4 border-ink md:border-t-0 md:border-l-4' : '',
                ].join(' ')}
              >
                <div
                  className={`w-16 h-16 border-4 border-ink flex items-center justify-center text-3xl shadow-[4px_4px_0_0_var(--color-ink)] ${pillar.iconBg} ${pillar.iconText}`}
                  aria-hidden="true"
                >
                  {pillar.icon}
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-ink">
                  {t(pillar.titleKey)}
                </h3>
                <p className="font-body text-body-md text-ink/75">
                  {t(pillar.bodyKey)}
                </p>
              </article>
            ))}
          </div>
        </SectionContainer>
      </section>

      {/* ───── 4. VALUES ───── */}
      <section className="border-b-4 border-ink bg-ink text-surface">
        <SectionContainer py="md">
          <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-8 mb-8">
            <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent shrink-0">
              {t('valuesHeading')}
            </p>
            <p className="font-body text-body-md text-surface/70 max-w-xl">
              {t('valuesSubtitle')}
            </p>
          </div>
          <ul className="flex flex-wrap gap-3">
            {VALUES.map((value, i) => (
              <li
                key={value}
                className={[
                  'inline-flex items-center px-5 py-2.5 border-4 border-surface font-label text-label-sm uppercase font-bold tracking-wider',
                  'shadow-[4px_4px_0_0_var(--color-accent)]',
                  i % 2 === 0
                    ? 'bg-accent text-ink -rotate-1'
                    : 'bg-primary text-surface rotate-1',
                ].join(' ')}
              >
                {value}
              </li>
            ))}
          </ul>
        </SectionContainer>
      </section>

      {/* ───── 5. CTA ───── */}
      <section className="bg-accent border-b-4 border-ink">
        <SectionContainer py="xl" className="text-center">
          <p className="font-label text-label-sm uppercase tracking-[0.3em] text-ink mb-6">
            {t('ctaEyebrow')}
          </p>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink mb-10 max-w-4xl mx-auto">
            {t('ctaTitle1')} <br />
            <span className="inline-block bg-ink text-accent px-3 py-1 -rotate-1">
              {t('ctaTitle2')}
            </span>
          </h2>
          <p className="font-body text-body-lg text-ink/80 max-w-2xl mx-auto mb-12">
            {t('ctaBody')}
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Button
              variant="primary"
              size="lg"
              href="/katalog"
              className="font-label text-label-sm font-black uppercase"
            >
              {t('ctaViewDevelop')}
            </Button>
            <NLink
              href="/display"
              variant="default"
              underline="hover"
              arrow
              className="text-ink"
            >
              {t('ctaViewJournal')}
            </NLink>
          </div>
        </SectionContainer>
      </section>
    </>
  );
}
