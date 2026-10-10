'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Card } from '@/components/ui/neobrutal';
import { NLink } from '@/components/ui/neobrutal';
import { MetaLabel } from '@/components/ui/MetaLabel';
import { SectionContainer } from '@/components/public/SectionContainer';
import { SectionTitle } from '@/components/ui';

import { formatRupiah } from '@/lib/format';
import type { Product } from '@/lib/types';
import { Image } from '@/components/ui/Image';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

interface Props {
  products: Product[];
}

/**
 * Featured Developments — Neobrutalism EnStudio.
 *
 * Translated via next-intl 'home' namespace.
 *
 * ponytail: kalau products kosong (mis. seed baru / API down), render
 * empty state hint supaya section tidak lowong confusing di homepage.
 */
export function FeaturedSection({ products }: Props) {
  const t = useTranslations('home');
  const tProduct = useTranslations('product.card');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // ScrollTrigger Showcase Entrance — header masuk, lalu tiap row menampil.
      gsap.fromTo(
        '[data-featured-header]',
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            once: true,
          },
        },
      );

      const rows = gsap.utils.toArray<HTMLElement>('[data-featured-row]');
      rows.forEach((row) => {
        gsap.fromTo(
          row,
          { autoAlpha: 0, y: 44 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 85%',
              once: true,
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const data: FeaturedItem[] = products.slice(0, 4).map((p, i) => ({
    title: p.nama,
    priceLabel: formatRupiah(p.harga),
    body: p.deskripsi || t('featuredFallback'),
    image: p.preview_images?.[0] ?? null,
    href: `/develop/${p.slug}`,
    artifact: `00${i + 1}`,
  }));

  return (
    <section ref={sectionRef} id="featured" className="border-b-4 border-ink">
      <SectionContainer py="xl">
        <div data-featured-header className="flex justify-between items-end mb-16">
          <SectionTitle className="leading-none">
            {t('featuredTitle')}
          </SectionTitle>
          <div className="hidden md:block font-label text-label-sm uppercase tracking-widest text-ink/70 pb-2">
            {t('featuredSubtitle')}
          </div>
        </div>

        {data.length === 0 ? (
          <p className="font-body text-body-md text-ink/60 italic">
            {t('featuredEmpty')}
          </p>
        ) : (
          <div className="flex flex-col gap-24">
            {data.map((item, i) => (
              <FeaturedRow
                key={item.href}
                item={item}
                flip={i % 2 === 1}
                viewLabel={tProduct('view')}
              />
            ))}
          </div>
        )}
      </SectionContainer>
    </section>
  );
}

interface FeaturedItem {
  title: string;
  priceLabel: string;
  body: string;
  image: string | null;
  href: string;
  artifact: string;
}

function FeaturedRow({
  item,
  flip,
  viewLabel,
}: {
  item: FeaturedItem;
  flip: boolean;
  viewLabel: string;
}) {
  return (
    <div
      data-featured-row
      className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center"
    >
      <div className={`md:col-span-8 ${flip ? 'md:order-2' : 'md:order-1'} order-1`}>
        <Card href={item.href} variant="surface" hoverable thick>
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <Image
              src={item.image}
              alt={item.title}
              className="w-full aspect-video"
            />
          ) : (
            <div className="w-full aspect-video bg-primary text-surface flex items-center justify-center font-display uppercase text-headline-md text-center px-6">
              {item.title}
            </div>
          )}
        </Card>
      </div>

      <div
        className={`md:col-span-4 ${flip ? 'md:order-1' : 'md:order-2'} order-2 flex flex-col gap-4`}
      >
        <span className="bg-accent text-ink border-4 border-ink px-4 py-1 font-label text-label-sm font-black uppercase w-fit">
          {item.priceLabel}
        </span>
        <h3 className="font-display text-headline-md text-primary uppercase">
          {item.title}
        </h3>
        <p className="font-body text-body-md text-ink/70">{item.body}</p>
        <NLink
          href={item.href}
          variant="primary"
          underline="hover"
          arrow
          className="mt-2 font-label text-label-sm font-black uppercase w-fit"
        >
          {viewLabel}
        </NLink>
      </div>
    </div>
  );
}

export type { FeaturedItem };
