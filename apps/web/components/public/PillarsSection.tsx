/**
 * Three-pillar block — Neobrutalism enpiistudio.
 *
 * Layout mockup (2+1 grid):
 *   - Discover  | Develop          (atas, 2 kolom, primary bg-ish untuk konten)
 *   - Display                       (bawah, full-width, surface-container bg)
 *
 * Setiap pillar: 64×64 icon badge + headline + body.
 * Translated via next-intl 'home' namespace.
 */

'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface Pillar {
  icon: string;
  iconBg: 'primary' | 'accent' | 'ink';
  iconText: 'surface' | 'ink';
  href: string;
  titleKey: 'pillarDiscover' | 'pillarDevelop' | 'pillarDisplay';
  bodyKey: 'pillarDiscoverBody' | 'pillarDevelopBody' | 'pillarDisplayBody';
}

const PILLARS: Pillar[] = [
  {
    icon: '◇',
    iconBg: 'primary',
    iconText: 'surface',
    href: '/discover',
    titleKey: 'pillarDiscover',
    bodyKey: 'pillarDiscoverBody',
  },
  {
    icon: '⟨⟩',
    iconBg: 'accent',
    iconText: 'ink',
    href: '/develop',
    titleKey: 'pillarDevelop',
    bodyKey: 'pillarDevelopBody',
  },
  {
    icon: '☷',
    iconBg: 'ink',
    iconText: 'surface',
    href: '/display',
    titleKey: 'pillarDisplay',
    bodyKey: 'pillarDisplayBody',
  },
];

export function PillarsSection() {
  const t = useTranslations('home');

  const iconCls = (p: Pillar) => {
    if (p.iconBg === 'primary') return 'bg-primary text-surface';
    if (p.iconBg === 'accent') return 'bg-accent text-ink';
    return 'bg-ink text-surface';
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 border-b-4 border-ink">
      {PILLARS.slice(0, 2).map((p, i) => (
        <Link
          key={p.href}
          href={p.href}
          className={[
            'group block bg-surface border-b-4 md:border-b-0 border-ink py-12 md:py-20 transition-all hover:bg-accent',
            // Cell pertama (Discover): padding kiri mepet viewport + border
            // kanan vertikal tengah. Cell kedua (Develop): padding kanan mepet
            // viewport, TANPA border tambahan.
            i === 0
              ? 'pl-6 md:pl-12 pr-12 md:pr-20 md:border-r-4'
              : 'pl-12 md:pl-20 pr-0',
          ].join(' ')}
        >
          <article className="flex flex-col gap-6">
            <div
              className={`w-16 h-16 border-4 border-ink flex items-center justify-center text-3xl ${iconCls(p)}`}
              aria-hidden="true"
            >
              {p.icon}
            </div>
            <h2 className="font-display text-headline-lg text-primary uppercase">
              {t(p.titleKey)}
            </h2>
            <p className="font-body text-body-lg text-ink/70 max-w-md">{t(p.bodyKey)}</p>
            <span className="font-label text-label-sm uppercase font-bold text-ink mt-2 group-hover:underline underline-offset-4">
              {t('pillarExplore', { title: t(p.titleKey) })}
            </span>
          </article>
        </Link>
      ))}

      {/* Display — full-width pillar */}
      <Link
        href="/display"
        className="md:col-span-2 block bg-surface/95 border-t-4 border-ink p-12 md:p-24 text-center transition-all hover:bg-accent"
      >
        <article className="flex flex-col items-center gap-6">
          <div
            className="w-16 h-16 border-4 border-ink bg-ink text-surface flex items-center justify-center text-3xl"
            aria-hidden="true"
          >
            ☷
          </div>
          <h2 className="font-display text-headline-lg text-primary uppercase">
            {t('pillarDisplay')}
          </h2>
          <p className="font-body text-body-lg text-ink/70 max-w-2xl">
            {t('pillarDisplayBody')}
          </p>
          <span className="font-label text-label-sm uppercase font-bold text-ink mt-2 group-hover:underline underline-offset-4">
            {t('pillarExplore', { title: t('pillarDisplay') })}
          </span>
        </article>
      </Link>
    </section>
  );
}