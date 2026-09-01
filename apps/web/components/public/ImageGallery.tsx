'use client';

import { useState } from 'react';

import { Button, Card } from '@/components/ui/neobrutal';
import { Image } from '@/components/ui/Image';

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
        <Image
          src={main}
          alt={alt}
          className="w-full h-full"
        />
      </Card>

      {images.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((img, i) => (
            <Button
              key={img + i}
              type="button"
              variant={i === active ? 'primary' : 'surface'}
              size="sm"
              onClick={() => setActive(i)}
              aria-label={`Lihat gambar ${i + 1}`}
              className={
                'block w-20 h-20 px-0 py-0 overflow-hidden !shadow-brutal-2 transition-all ' +
                (i === active
                  ? 'ring-4 ring-primary ring-offset-2 ring-offset-surface'
                  : 'opacity-70 hover:opacity-100')
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image
                src={img}
                alt=""
                className="w-full h-full"
              />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
