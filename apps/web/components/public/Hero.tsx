'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { Icon } from '@/components/ui';
import { SectionContainer } from './SectionContainer';
import {
  CornerCrosshairs,
  TechnicalSticker,
} from './BrutalistOverlay';

export function Hero() {
  const t = useTranslations('home');
  return (
    // relative: jangkar CornerCrosshairs di 4 sudut section.
    <section className="relative min-h-[52vh] sm:min-h-[68vh] flex flex-col items-center justify-center text-center border-b-4 border-ink">
      <SectionContainer py="xl">
        {/* relative: crosshair menempel di 4 sudut area konten. */}
        <div className="relative">
          <CornerCrosshairs />

          {/*
           * Stiker zine — mobile: tersusun rapi sebagai baris badge di atas
           * headline (parent TETAP dalam alur normal agar selalu terlihat).
           * md+: hanya <span> pembungkus tiap stiker yang dilepas absolute ke
           * sudut kiri & kanan area headline. Semua `pointer-events-none`.
           */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="md:absolute md:top-0 md:left-0">
              <TechnicalSticker
                variant="accent"
                rotate="-rotate-2"
                text="⚡ RAW ARCHITECTURE // SPEC 01"
              />
            </span>
            <span className="md:absolute md:top-0 md:right-0">
              <TechnicalSticker
                variant="surface"
                rotate="rotate-2"
                text="● INDEPENDENT DIGITAL STUDIO"
              />
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-headline-xl text-primary leading-none mb-10 uppercase break-words">
            ENSTUDIO <br />
            <span className="inline-block bg-ink text-accent px-6 py-2 transform -rotate-1">
              DISCOVER,
            </span>
            <br />
            DEVELOP, DISPLAY
          </h1>

          <p className="font-body text-body-md sm:text-body-lg max-w-2xl mx-auto italic text-ink/80 mb-8 border-x-4 border-accent px-8">
            {t('heroSubtitle')}
          </p>

          {/* Technical tag ribbon — metadata teknis ala blueprint. */}
          <div className="mb-12 flex justify-center">
            <span className="font-mono text-xs tracking-wider text-ink/60 uppercase py-1 px-3 border border-ink/20 inline-flex flex-wrap items-center justify-center gap-3 bg-surface/50 pointer-events-none">
              [REF: 04.34.8B] · [GRID 12-COL] · [LAT: -7.4705°] · [ZINE ISSUE: 01]
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Button
              variant="accent"
              size="lg"
              href="/develop"
              className="font-label text-label-sm font-black uppercase"
            >
              <span className="inline-flex items-center gap-2">
                {t('heroCta')}
                <Icon name="arrow-right" />
              </span>
            </Button>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
