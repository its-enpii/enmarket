'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';

import { Button } from '@/components/ui/neobrutal';
import { Icon } from '@/components/ui';
import { SectionContainer } from './SectionContainer';
import { CornerCrosshairs, TechnicalSticker } from './BrutalistOverlay';
import { DraftingCompass, DraftingPencil, TriangleRuler } from './DraftingTools';

export function Hero() {
  const t = useTranslations('home');
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // Mechanical Blueprint Entry — gerakan snappy & berbobot ala blueprint.
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '[data-hero-crosshairs]',
        { autoAlpha: 0, scale: 0.6 },
        { autoAlpha: 1, scale: 1, duration: 0.5 },
      )
        .fromTo(
          '[data-hero-headline]',
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.7 },
          '-=0.3',
        )
        .fromTo(
          '[data-hero-sticker-left]',
          { autoAlpha: 0, y: -24, rotation: -6 },
          {
            autoAlpha: 1,
            y: 0,
            rotation: -2,
            duration: 0.6,
            ease: 'back.out(2)',
          },
          '-=0.4',
        )
        .fromTo(
          '[data-hero-sticker-right]',
          { autoAlpha: 0, y: -24, rotation: 6 },
          {
            autoAlpha: 1,
            y: 0,
            rotation: 2,
            duration: 0.6,
            ease: 'back.out(2)',
          },
          '-=0.5',
        )
        .fromTo(
          '[data-hero-sub]',
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          '-=0.3',
        )
        .fromTo(
          '[data-hero-ribbon]',
          { autoAlpha: 0, scale: 0.95 },
          { autoAlpha: 1, scale: 1, duration: 0.4 },
          '-=0.2',
        )
        .fromTo(
          '[data-hero-tools-compass]',
          { autoAlpha: 0, scale: 0.7, rotation: -8 },
          { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.3',
        )
        .fromTo(
          '[data-hero-tools-pencil]',
          { autoAlpha: 0, y: -20, rotation: -6 },
          { autoAlpha: 1, y: 0, rotation: 0, duration: 0.55, ease: 'power2.out' },
          '-=0.4',
        )
        .fromTo(
          '[data-hero-tools-ruler]',
          { autoAlpha: 0, scale: 0.7, rotation: -8 },
          { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.4',
        )
        .fromTo(
          '[data-hero-cta]',
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.4 },
          '-=0.2',
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    // relative: jangkar CornerCrosshairs di 4 sudut section.
    <section
      ref={heroRef}
      className="relative min-h-[52vh] sm:min-h-[68vh] flex flex-col items-center justify-center text-center border-b-4 border-ink"
    >
      <SectionContainer py="xl">
        {/* relative: crosshair & stiker menempel di area konten. */}
        <div className="relative">
          <span data-hero-crosshairs className="contents">
            <CornerCrosshairs />
          </span>

          {/*
           * Ornamen drafting tools disebar di ruang kosong hero — kiri, kanan,
           * dan sisi bawah (dekat Technical Ribbon). Kontras tonal monokrom
           * seragam text-ink/25 (watermark kanvas). Reveal halus via timeline
           * GSAP (stagger).
           * 100% pointer-events-none select-none.
           */}
          <DraftingCompass
            data-hero-tools-compass
            size={44}
            className="hidden md:block absolute top-1/3 -left-4 lg:-left-12 text-ink/25 -rotate-12 pointer-events-none select-none"
          />
          <DraftingPencil
            data-hero-tools-pencil
            size={44}
            className="hidden md:block absolute top-1/4 -right-4 lg:-right-12 text-ink/25 rotate-12 pointer-events-none select-none"
          />

          {/*
           * Stiker zine — mobile: tersusun rapi sebagai baris badge di atas
           * headline (parent TETAP dalam alur normal agar selalu terlihat).
           * md+: hanya <span> pembungkus tiap stiker yang dilepas absolute ke
           * sudut kiri & kanan area headline. Semua `pointer-events-none`.
           */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span data-hero-sticker-left className="md:absolute md:top-0 md:left-0">
              <TechnicalSticker
                variant="accent"
                rotate="-rotate-2"
                text="⚡ RAW ARCHITECTURE // SPEC 01"
              />
            </span>
            <span data-hero-sticker-right className="md:absolute md:top-0 md:right-0">
              <TechnicalSticker
                variant="surface"
                rotate="rotate-2"
                text="● INDEPENDENT DIGITAL STUDIO"
              />
            </span>
          </div>

          <h1
            data-hero-headline
            className="font-display text-4xl sm:text-6xl md:text-headline-xl text-primary leading-none mb-10 uppercase break-words"
          >
            ENSTUDIO <br />
            <span className="inline-block bg-ink text-accent px-6 py-2 transform -rotate-1">
              DISCOVER,
            </span>
            <br />
            DEVELOP, DISPLAY
          </h1>

          <p
            data-hero-sub
            className="font-body text-body-md sm:text-body-lg max-w-2xl mx-auto italic text-ink/80 mb-8 border-x-4 border-accent px-8"
          >
            {t('heroSubtitle')}
          </p>

          {/* Technical tag ribbon — metadata teknis ala blueprint, ditemani
              ornamen penggaris segitiga neobrutal (reveal via timeline Hero). */}
          <div className="relative mb-12 flex justify-center">
            <span
              data-hero-ribbon
              className="font-mono text-xs tracking-wider text-ink/60 uppercase py-1 px-3 border border-ink/20 inline-flex flex-wrap items-center justify-center gap-3 bg-surface/50 pointer-events-none"
            >
              [REF: 04.34.8B] · [GRID 12-COL] · [LAT: -7.4705°] · [ZINE ISSUE: 01]
            </span>
            {/* Penggaris segitiga aksen — absolut di kanan ribbon, di dalam
                alur konten agar tidak memicu horizontal overflow. */}
            <TriangleRuler
              data-hero-tools-ruler
              size={40}
              className="hidden md:block absolute top-0 md:left-[calc(50%+15rem)] text-ink/25 rotate-6 pointer-events-none select-none"
            />
          </div>

          <div data-hero-cta className="flex flex-col md:flex-row gap-6 justify-center">
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
