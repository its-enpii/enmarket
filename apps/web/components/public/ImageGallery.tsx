'use client';

import { useState } from 'react';

import { Card } from '@/components/ui/neobrutal';

interface Props {
  images: string[];
  alt: string;
}

/**
 * Image gallery sederhana — pilih dari thumbnail, tampil besar.
 * Fallback ke blok primary kalau images kosong.
 */
export function ImageGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <Card variant="filled-primary" hoverable={false} thick className="aspect-video flex items-center justify-center">
        <span className="font-bold text-lg uppercase tracking-wider opacity-80">
          Tanpa Gambar
        </span>
      </Card>
    );
  }

  const main = images[active];

  return (
    <div>
      <Card variant="surface" hoverable={false} thick className="aspect-video overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={main}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </Card>

      {images.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Lihat gambar ${i + 1}`}
              className={
                'block border-2 border-ink w-20 h-20 overflow-hidden shadow-[2px_2px_0_0_var(--color-ink)] transition-all ' +
                (i === active
                  ? 'ring-4 ring-primary ring-offset-2 ring-offset-surface'
                  : 'opacity-70 hover:opacity-100')
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}