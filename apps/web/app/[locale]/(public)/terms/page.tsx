import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/public/PageHeader';
import { SectionContainer } from '@/components/public/SectionContainer';
import { Card, NLink } from '@/components/ui/neobrutal';
import { Eyebrow } from '@/components/ui/neobrutal';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });
  return {
    ...buildMetadata({ title: t('metaTitle'), description: t('metaDescription') }),
    alternates: { canonical: `/${locale}/terms` },
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });
  // Build sections snapshot on server — typed loosely to avoid drift with messages shape.
  type Sec = { heading: string; paragraphs: string[] };
  const raw = (await import(`../../../../messages/${locale === 'en' ? 'en' : 'id'}.json`)).default as {
    terms: { sections: Sec[] };
  };
  const sections: Sec[] = raw.terms.sections;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
      <SectionContainer py="lg">
        {/* Meta bar: last updated + TOC */}
        <Card variant="surface" thick hoverable={false} className="p-6 md:p-8 mb-8">
          <p className="font-label text-label-sm uppercase tracking-wider text-ink/60 mb-4">
            {t('updated', { date: today })}
          </p>
          <Eyebrow size="md" color="accent" className="mb-3">
            {t('tocLabel')}
          </Eyebrow>
          <ol className="list-decimal pl-5 space-y-1 font-body text-body-sm text-ink/80">
            {sections.map((s) => (
              <li key={slugify(s.heading)}>
                <a href={`#${slugify(s.heading)}`} className="underline decoration-accent underline-offset-4 hover:decoration-ink">
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </Card>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6">
          {sections.map((s) => (
            <section
              key={slugify(s.heading)}
              id={slugify(s.heading)}
              className="scroll-mt-28 border-4 border-ink bg-surface p-6 md:p-8 shadow-brutal-6"
            >
              <h2 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-ink mb-3">
                {s.heading}
              </h2>
              <div className="space-y-3 font-body text-body-md text-ink/80 leading-relaxed">
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="max-w-3xl">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <NLink href="/" variant="default">
            {t('backLinkText')}
          </NLink>
          <NLink href="/privacy" variant="default" arrow>
            {locale === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}
          </NLink>
        </div>
      </SectionContainer>
    </>
  );
}
