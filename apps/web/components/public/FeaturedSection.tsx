'use client';

import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/neobrutal';
import { NLink } from '@/components/ui/neobrutal';

import { formatRupiah } from '@/lib/format';
import type { Product } from '@/lib/types';

interface Props {
  products: Product[];
}

/**
 * Featured Developments — Neobrutalism enpiistudio.
 *
 * Translated via next-intl 'home' namespace.
 */
export function FeaturedSection({ products }: Props) {
  const t = useTranslations('home');
  const tProduct = useTranslations('product.card');

  const data: FeaturedItem[] = products.length >= 4
    ? products.slice(0, 4).map((p, i) => ({
        title: p.nama,
        priceLabel: formatRupiah(p.harga),
        body:
          p.deskripsi ||
          'Digital artifact dari studio enpii — karya yang bisa diunduh, dipakai, atau dinikmati.',
        image: p.preview_images?.[0] ?? null,
        href: `/develop/${p.slug}`,
        artifact: `00${i + 1}`,
      }))
    : PLACEHOLDER_ITEMS;

  return (
    <section id="featured" className="py-24 px-6 md:px-12 border-b-4 border-ink">
      <div className="flex justify-between items-end mb-16">
        <h2 className="font-display text-headline-lg text-ink uppercase leading-none">
          {t('featuredTitle')}
        </h2>
        <div className="hidden md:block font-label text-label-sm uppercase tracking-widest text-ink/70 pb-2">
          {t('featuredSubtitle')}
        </div>
      </div>

      <div className="flex flex-col gap-24">
        {data.map((item, i) => (
          <FeaturedRow
            key={item.title}
            item={item}
            flip={i % 2 === 1}
            viewLabel={tProduct('view')}
          />
        ))}
      </div>
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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
      <div className={`md:col-span-8 ${flip ? 'md:order-2' : 'md:order-1'} order-1`}>
        <Card href={item.href} variant="surface" hoverable thick>
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              className="w-full aspect-video object-cover"
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
        <span className="bg-accent text-ink neobrutal-border px-4 py-1 font-label text-label-sm font-black uppercase w-fit">
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

const PLACEHOLDER_ITEMS: FeaturedItem[] = [
  {
    title: 'Linear Flux UI Kit',
    priceLabel: '$49.00',
    body: 'A comprehensive design system for developers who value structural honesty and high-contrast precision.',
    image: null,
    href: '/katalog',
    artifact: '001',
  },
  {
    title: 'Mono Terminal Theme',
    priceLabel: '$24.00',
    body: 'Optimal legibility for long coding sessions. Minimalist, focused, and unyielding.',
    image: null,
    href: '/katalog',
    artifact: '002',
  },
  {
    title: 'Grid Break Wallpapers',
    priceLabel: '$15.00',
    body: 'High-resolution desktop assets that challenge the standard 12-column constraint.',
    image: null,
    href: '/katalog',
    artifact: '003',
  },
  {
    title: 'Process Artifacts Vol. 1',
    priceLabel: '$35.00',
    body: 'A 200-page digital publication detailing internal workflows.',
    image: null,
    href: '/katalog',
    artifact: '004',
  },
];

export type { FeaturedItem };