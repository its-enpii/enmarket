'use client';

/**
 * WorkGallery — irregular image grid untuk Work Detail page.
 *
 * Layout: distribusi gambar ke 3 ukuran (large 2x2, medium 2x1, small 1x1)
 * dengan border-thick + hard shadow. Indices di-pick via modulo pattern
 * deterministic — bukan random, biar SSR/CSR match (no hydration mismatch).
 *
 * Pattern (8 gambar):
 *   [LARGE  ][SMALL][SMALL]
 *   [SMALL  ][MEDIUM    ]
 *   [SMALL][MEDIUM      ]
 *   [LARGE              ]
 *
 * Untuk <=2 gambar: pakai grid sederhana tanpa irregular pattern.
 */

import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface Props {
  images: string[];
  alt: string;
  /** Optional product title — fallback kalau image dimuat sebagai decorative block. */
  title: string;
}

export function WorkGallery({ images, alt, title }: Props) {
  const t = useTranslations('developDetail');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-primary text-surface border-4 border-ink shadow-[8px_8px_0_0_var(--color-ink)] flex items-center justify-center -rotate-1">
        <span className="font-display font-black uppercase text-3xl md:text-5xl text-center px-6 tracking-tighter">
          {title}
        </span>
      </div>
    );
  }

  // Single image — block besar dengan subtle rotate
  if (images.length === 1) {
    return (
      <button
        type="button"
        onClick={() => setActiveIdx(0)}
        className="block w-full bg-surface border-4 border-ink shadow-[8px_8px_0_0_var(--color-ink)] overflow-hidden -rotate-1 hover:rotate-0 transition-transform cursor-pointer"
        aria-label={t('galleryOpen', { name: alt })}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0]}
          alt={alt}
          className="w-full aspect-[4/3] object-cover"
        />
      </button>
    );
  }

  return (
    <>
      {/* Irregular grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 grid-rows-[auto_auto_auto_auto] gap-4 md:gap-6">
        {images.slice(0, 8).map((src, i) => {
          const pattern = i % 5;
          // pattern 0: large (2 col × 2 row)
          // pattern 1: small (1 col × 1 row)
          // pattern 2: small (1 col × 1 row)
          // pattern 3: medium (2 col × 1 row)
          // pattern 4: small (1 col × 1 row)
          const isLarge = pattern === 0;
          const isMedium = pattern === 3;

          // Mobile (2-col): large tile = full-width (col-span-2), medium = full-width,
          // small tiles pair up per row. Desktop (4-col): irregular mosaic.
          const colSpan = isLarge || isMedium
            ? 'col-span-2'
            : 'col-span-1';
          const aspectClass = isLarge ? 'aspect-square' : isMedium ? 'aspect-[2/1] sm:aspect-[2/1]' : 'aspect-square';
          const rotate = i % 3 === 0 ? '-rotate-1' : i % 3 === 1 ? 'rotate-1' : '';
          const shadowSize = isLarge ? 'shadow-[10px_10px_0_0_var(--color-ink)]' : 'shadow-[6px_6px_0_0_var(--color-ink)]';

          return (
            <button
              key={src + i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={[
                colSpan,
                'group block bg-surface border-4 border-ink overflow-hidden cursor-pointer',
                shadowSize,
                rotate,
                'hover:rotate-0 transition-transform',
              ].join(' ')}
              aria-label={t('galleryOpenNumber', { number: i + 1 })}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={t('galleryFrame', { name: alt, number: i + 1 })}
                loading="lazy"
                className={`w-full ${aspectClass} object-cover group-hover:scale-[1.02] transition-transform`}
              />
            </button>
          );
        })}
      </div>

      {/* Lightbox — minimal, modal overlay */}
      {activeIdx !== null && (
        <div
          className="fixed inset-0 z-[60] bg-ink/95 flex items-center justify-center p-4 md:p-12 cursor-pointer"
          onClick={() => setActiveIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label={t('galleryDialog')}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeIdx]}
            alt={alt}
            className="max-w-full max-h-full object-contain border-4 border-surface shadow-[12px_12px_0_0_var(--color-accent)]"
          />
          <span className="absolute top-6 right-6 text-surface font-label text-label-sm uppercase font-bold tracking-wider border-2 border-surface px-4 py-2">
            ✕ {t('galleryClose')}
          </span>
          <span className="absolute bottom-6 left-6 text-surface font-label text-label-sm uppercase font-bold tracking-wider">
            {activeIdx + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}