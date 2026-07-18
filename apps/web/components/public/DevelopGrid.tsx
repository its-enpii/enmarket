'use client';

/**
 * DevelopGrid — infinite-scroll wrapper untuk Develop page.
 *
 * Behavior:
 *   - Render initialProducts (SSR) langsung, no flash.
 *   - Sentinel <div> di bawah grid diobserve via IntersectionObserver.
 *   - Saat sentinel visible → fetch page+1, append products.
 *   - Fallback button "Load more" tampil kalau observer tidak fire (slow JS / no IO).
 *   - Kalau last_page reached → tampil "End of catalog" marker.
 *   - Saat filter (tipe/q) berubah, page reloaded via URL → component reset dari
 *     initialProducts baru — tidak ada state stacking issue.
 *
 * Layout: asymmetric (large/small alternating) + divider quote tiap 3 item.
 * Server-side punya logic sama; component ini me-replicate-nya dengan startIndex.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Card, NLink } from '@/components/ui/neobrutal';
import { Badge } from '@/components/ui/Badge';
import { formatRupiah } from '@/lib/format';
import type { PaginationMeta, Product } from '@/lib/types';

interface Props {
  initialProducts: Product[];
  initialMeta: PaginationMeta;
  filterKey: string; // serialized "tipe=q&page=1" — biar useEffect reset saat filter change
}

interface LoadResult {
  data: Product[];
  meta: PaginationMeta;
}

async function fetchPage(
  page: number,
  filterKey: string,
): Promise<LoadResult | null> {
  // filterKey berisi query string existing (tipe + q). Append page.
  const sp = new URLSearchParams(filterKey);
  sp.set('page', String(page));
  sp.set('per_page', '9');

  try {
    const res = await fetch(`/api/public/products?${sp.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as LoadResult;
  } catch {
    return null;
  }
}

export function DevelopGrid({ initialProducts, initialMeta, filterKey }: Props) {
  const t = useTranslations('develop');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset saat filter berubah (parent re-renders dengan initialProducts baru).
  useEffect(() => {
    setProducts(initialProducts);
    setMeta(initialMeta);
    setError(null);
  }, [filterKey, initialProducts, initialMeta]);

  const hasMore = meta.current_page < meta.last_page;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    const next = meta.current_page + 1;
    const result = await fetchPage(next, filterKey);
    if (!result) {
      setError(t('loadError'));
      setLoading(false);
      return;
    }
    setProducts((prev) => {
      // Dedup by id (defensive — kalau backend pernah return dup).
      const seen = new Set(prev.map((p) => p.id));
      const fresh = result.data.filter((p) => !seen.has(p.id));
      return [...prev, ...fresh];
    });
    setMeta(result.meta);
    setLoading(false);
  }, [loading, hasMore, meta.current_page, filterKey, t]);

  // IntersectionObserver — trigger loadMore saat sentinel visible.
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') return; // SSR / old browser

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '400px 0px' }, // pre-fetch 400px sebelum visible
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore, products.length]); // re-attach saat list grows

  return (
    <>
      <div className="space-y-12">
        {products.map((product, i) => (
          <Fragment
            key={product.id}
            product={product}
            index={i}
            studioNote={t('studioNote')}
            quote={t(`divider${(Math.floor(i / 3) % 3) + 1}` as 'divider1' | 'divider2' | 'divider3')}
            fallbackDescription={t('fallbackDescription')}
            viewLabel={t('view')}
          />
        ))}
      </div>

      {/* Sentinel — invisible trigger point */}
      {hasMore && (
        <div
          ref={sentinelRef}
          aria-hidden="true"
          className="h-1 w-full"
        />
      )}

      {/* Fallback / status bar — selalu render biar UI kasih feedback */}
      <div className="mt-12 flex flex-col items-center gap-4">
        {hasMore && (
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center px-8 py-3 bg-ink text-surface border-4 border-ink shadow-[6px_6px_0_0_var(--color-accent)] font-label text-label-sm uppercase font-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--color-accent)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[3px_3px_0_0_var(--color-accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="inline-block w-3 h-3 bg-accent mr-3 animate-pulse" />
                {t('loading')}
              </>
            ) : (
              t('loadMore')
            )}
          </button>
        )}

        {!hasMore && products.length > 0 && (
          <p className="font-label text-label-sm uppercase tracking-[0.3em] text-ink/40">
            {t('end', { count: meta.total })}
          </p>
        )}

        {error && (
          <p className="font-body text-body-sm text-accent">{error}</p>
        )}
      </div>
    </>
  );
}

// ───── Fragment + DevelopCard (mirror dari server version) ─────

function Fragment({
  product,
  index,
  studioNote,
  quote,
  fallbackDescription,
  viewLabel,
}: {
  product: Product;
  index: number;
  studioNote: string;
  quote: string;
  fallbackDescription: string;
  viewLabel: string;
}) {
  const isLarge = index % 2 === 0;
  const showDivider = (index + 1) % 3 === 0 && index < 12;

  return (
    <>
      <DevelopCard
        product={product}
        variant={isLarge ? 'large' : 'small'}
        fallbackDescription={fallbackDescription}
        viewLabel={viewLabel}
      />
      {showDivider && (
        <div className="bg-primary text-surface border-4 border-ink shadow-[8px_8px_0_0_var(--color-ink)] p-10 md:p-16 -rotate-[0.5deg]">
          <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-4">
            {studioNote}
          </p>
          <p className="font-display text-2xl md:text-4xl font-black uppercase leading-tight">
            “{quote}”
          </p>
        </div>
      )}
    </>
  );
}

function DevelopCard({
  product,
  variant,
  fallbackDescription,
  viewLabel,
}: {
  product: Product;
  variant: 'large' | 'small';
  fallbackDescription: string;
  viewLabel: string;
}) {
  const thumb = product.preview_images?.[0];
  const href = `/develop/${product.slug}`;
  const title = product.nama;
  const body = product.deskripsi || fallbackDescription;
  const oneLiner = body.length > 110 ? body.slice(0, 110).trim() + '…' : body;
  const priceLabel = formatRupiah(product.harga);
  const kategoriNama = product.category?.nama ?? null;

  if (variant === 'large') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-7">
          <Card href={href} variant="surface" hoverable thick className="h-full">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumb}
                alt={title}
                loading="lazy"
                className="w-full aspect-video object-cover"
              />
            ) : (
              <div className="w-full aspect-video bg-primary text-surface flex items-center justify-center font-display uppercase text-2xl md:text-4xl text-center px-6">
                {title}
              </div>
            )}
          </Card>
        </div>
        <div className="md:col-span-5 flex flex-col justify-center gap-4 border-l-4 border-ink pl-6">
          {kategoriNama && (
            <p className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/60">
              {kategoriNama}
            </p>
          )}
          <h3 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-ink leading-tight">
            {title}
          </h3>
          <p className="font-body text-body-md text-ink/75">{oneLiner}</p>
          <div className="flex items-center justify-between mt-2">
            <Badge tone="accent" size="md">
              {priceLabel}
            </Badge>
            <NLink
              href={href}
              variant="primary"
              underline="hover"
              arrow
              className="font-label text-label-sm uppercase font-bold"
            >
              {viewLabel}
            </NLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <div className="md:col-span-5 md:order-2">
        <Card href={href} variant="surface" hoverable thick className="h-full">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={title}
              loading="lazy"
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="w-full aspect-square bg-accent text-ink flex items-center justify-center font-display uppercase text-xl md:text-2xl text-center px-4">
              {title}
            </div>
          )}
        </Card>
      </div>
      <div className="md:col-span-7 md:order-1 flex flex-col justify-center gap-3 border-l-4 border-ink pl-6">
        {kategoriNama && (
          <p className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/60">
            {kategoriNama}
          </p>
        )}
        <h3 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-ink leading-tight">
          {title}
        </h3>
        <p className="font-body text-body-sm text-ink/70">
          {body.slice(0, 90).trim()}
          {body.length > 90 ? '…' : ''}
        </p>
        <div className="flex items-center justify-between mt-2">
          <Badge tone="accent" size="md">
            {priceLabel}
          </Badge>
          <NLink
            href={href}
            variant="primary"
            underline="hover"
            arrow
            className="font-label text-label-sm uppercase font-bold"
          >
            View
          </NLink>
        </div>
      </div>
    </div>
  );
}

// ───── Fragment + DevelopCard (mirror dari server version) ─────