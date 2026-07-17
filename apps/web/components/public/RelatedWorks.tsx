/**
 * RelatedWorks — "More from the studio" section di Work Detail page.
 *
 * Strategy:
 *   - Kalau product punya category → fetch `catalog?category={slug}&per_page=8`,
 *     filter out current slug, ambil 3 pertama.
 *   - Kalau tidak ada category atau fetch gagal → fallback ke `latestProducts()`,
 *     filter out current, ambil 3.
 *
 * Render: 3 cards compact di grid 1/2/3-cols. Pakai primitive `Card` untuk
 * konsistensi dengan /develop list.
 */

import { Card, NLink } from '@/components/ui/neobrutal';
import { getTranslations } from 'next-intl/server';
import { formatRupiah } from '@/lib/format';
import { publicApi } from '@/lib/public-api';
import type { Product } from '@/lib/types';

interface Props {
  currentSlug: string;
  categorySlug?: string;
}

async function fetchRelated(currentSlug: string, categorySlug?: string): Promise<Product[]> {
  try {
    if (categorySlug) {
      const res = await publicApi.catalog({ category: categorySlug, per_page: 8, page: 1 });
      const filtered = (res.data ?? []).filter((p) => p.slug !== currentSlug);
      if (filtered.length > 0) return filtered.slice(0, 3);
    }
    // Fallback — latest products
    const res = await publicApi.latestProducts();
    const filtered = (res.data ?? []).filter((p) => p.slug !== currentSlug);
    return filtered.slice(0, 3);
  } catch {
    return [];
  }
}

export async function RelatedWorks({ currentSlug, categorySlug }: Props) {
  const [related, t] = await Promise.all([
    fetchRelated(currentSlug, categorySlug),
    getTranslations('developDetail'),
  ]);

  if (related.length === 0) {
    return null;
  }

  return (
    <section className="border-t-4 border-ink bg-surface">
      <div className="px-6 md:px-12 py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-3">
              {t('relatedEyebrow')}
            </p>
            <h2 className="font-display text-headline-lg-mobile md:text-headline-lg font-extrabold uppercase tracking-tight text-ink">
              {t('relatedTitle')}
            </h2>
          </div>
          <NLink
            href="/develop"
            variant="primary"
            underline="static"
            arrow
            className="font-label text-label-sm uppercase font-bold"
          >
            {t('relatedAll')}
          </NLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.map((product) => (
            <RelatedCard
              key={product.id}
              product={product}
              fallbackDescription={t('relatedFallback')}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedCard({
  product,
  fallbackDescription,
}: {
  product: Product;
  fallbackDescription: string;
}) {
  const thumb = product.preview_images?.[0];
  const href = `/develop/${product.slug}`;
  const title = product.nama;
  const priceLabel = formatRupiah(product.harga);

  return (
    <Card href={href} variant="surface" hoverable className="overflow-hidden h-full flex flex-col">
      <div className="aspect-square bg-primary/10 border-b-2 border-ink overflow-hidden">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary text-surface flex items-center justify-center font-display uppercase text-lg text-center px-3">
            {title}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-black uppercase tracking-tight text-ink leading-tight line-clamp-2">
            {title}
          </h3>
          <p className="mt-1 text-xs text-ink/60 line-clamp-2">
            {product.deskripsi?.slice(0, 80) ?? fallbackDescription}
          </p>
        </div>
        <span className="inline-flex items-center self-start bg-accent text-ink border-2 border-ink px-3 py-1 font-label text-label-sm font-black uppercase shadow-[3px_3px_0_0_var(--color-ink)]">
          {priceLabel}
        </span>
      </div>
    </Card>
  );
}