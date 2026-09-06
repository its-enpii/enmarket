/**
 * LegalPage — layout bersama halaman legal publik (terms, privacy).
 *
 * Grid 2 kolom (lg+):
 *   - Kiri: card "Terakhir diperbarui" + Daftar isi, sticky (top-28, sejajar
 *     scroll-mt-28 pada section, menghindari tertutup TopNav sticky z-nav).
 *   - Kanan: section-section legal yang mengikuti scroll halaman.
 * Mobile (<lg): stack 1 kolom — TOC di atas, konten di bawah.
 *
 * Markup section/TOC sebelumnya duplikat di 2 page.tsx (terms, privacy) —
 * dikonsolidasi di sini sesuai aturan component-first.
 */

import { PageHeader } from '@/components/public/PageHeader';
import { SectionContainer } from '@/components/public/SectionContainer';
import { Card, Eyebrow, NLink } from '@/components/ui/neobrutal';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Sudah ter-interpolasi (mis. "Terakhir diperbarui: 2026-09-06"). */
  updated: string;
  tocLabel: string;
  /** Path TANPA prefix locale — NLink yang wrap (mis. "/", "/privacy"). */
  backHref: string;
  backLabel: string;
  crossHref: string;
  crossLabel: string;
  sections: LegalSection[];
}

export function slugifyHeading(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function LegalPage({
  eyebrow,
  title,
  subtitle,
  updated,
  tocLabel,
  backHref,
  backLabel,
  crossHref,
  crossLabel,
  sections,
}: Props) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <SectionContainer py="lg">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
          {/* Kiri — TOC sticky (lg+) */}
          <aside className="lg:sticky lg:top-28">
            <Card variant="surface" thick hoverable={false} className="p-6 md:p-8">
              <p className="font-label text-label-sm uppercase tracking-wider text-ink/60 mb-4">
                {updated}
              </p>
              <Eyebrow size="md" color="accent" className="mb-3">
                {tocLabel}
              </Eyebrow>
              <ol className="list-decimal pl-5 space-y-1 font-body text-body-sm text-ink/80">
                {sections.map((s) => (
                  <li key={slugifyHeading(s.heading)}>
                    <a
                      href={`#${slugifyHeading(s.heading)}`}
                      className="underline decoration-accent underline-offset-4 hover:decoration-ink"
                    >
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </Card>
          </aside>

          {/* Kanan — konten */}
          <div className="min-w-0 space-y-6">
            {sections.map((s) => (
              <section
                key={slugifyHeading(s.heading)}
                id={slugifyHeading(s.heading)}
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

            <div className="flex flex-wrap gap-4 pt-2">
              <NLink href={backHref} variant="default">
                {backLabel}
              </NLink>
              <NLink href={crossHref} variant="default" arrow>
                {crossLabel}
              </NLink>
            </div>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
