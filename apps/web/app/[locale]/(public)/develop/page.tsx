/**
 * Develop — curated catalog of studio works (enpiistudio).
 *
 * Brief: halaman ini BUKAN e-commerce grid. Rasanya seperti flipping through
 * designer's curated collection — harga secondary, vibe primary.
 *
 * 5 sections (sesuai brief user):
 *   1. Header — "Develop" oversized + 1-line subtitle
 *   2. Filter pills (left) + search (right) — single row, pills for tipe filter
 *   3. Asymmetric catalog grid — large+small bordered cards, infinite scroll
 *      (mid-grid divider quote setelah setiap 3 item, max 4 dividers)
 *   4. Footer teaser — bordered block linking to Display
 *
 * Layout: full-width sections, padding konsisten px-6 md:px-12.
 * Tone: editorial / curated, bukan listing template.
 */

import { getTranslations } from 'next-intl/server';

import { DevelopGrid } from '@/components/public/DevelopGrid';
import { PageHeader } from '@/components/public/PageHeader';
import { SearchBar } from '@/components/public/SearchBar';
import { SectionContainer } from '@/components/public/SectionContainer';
import { Button, Eyebrow, NLink } from '@/components/ui/neobrutal';
import { SectionBand, SectionIntro } from '@/components/ui';
import { publicApi, PublicFetchError } from '@/lib/public-api';
import { VALID_TIPE, type Tipe } from '@/lib/constants';
import type { PaginatedResponse, Product } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


// ───── Constants ─────

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tipe?: string; page?: string; q?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'develop' });
  return {
    ...buildMetadata({
      title: `${t('title')} — enpiistudio`,
      description: t('listSubtitle'),
    }),
    alternates: { canonical: `/${locale}/develop` },
  };
}

const FILTER_PILLS: Array<{ key: 'filterAll' | 'typeDownload' | 'typeLicense' | 'typeBundle'; value: 'all' | Tipe }> = [
  { key: 'filterAll', value: 'all' },
  { key: 'typeDownload', value: 'download' },
  { key: 'typeLicense', value: 'license' },
  { key: 'typeBundle', value: 'bundle' },
];

// ───── Data fetch ─────

async function fetchCatalog(
  tipe: Tipe | undefined,
  pageNum: number,
  q: string | undefined,
): Promise<PaginatedResponse<Product> | null> {
  try {
    return await publicApi.catalog({ tipe, page: pageNum, per_page: 9, q });
  } catch (err) {
    if (err instanceof PublicFetchError) {
      return {
        data: [],
        meta: { current_page: 1, last_page: 1, per_page: 9, total: 0 },
      };
    }
    throw err;
  }
}

// ───── Component ─────

export default async function DevelopPage({ searchParams }: PageProps) {
  const t = await getTranslations('develop');
  const sp = await searchParams;
  const activeTipe: 'all' | Tipe =
    typeof sp.tipe === 'string' && VALID_TIPE.includes(sp.tipe as Tipe)
      ? (sp.tipe as Tipe)
      : 'all';
  const q = typeof sp.q === 'string' && sp.q.trim() ? sp.q.trim() : undefined;

  const catalog = await fetchCatalog(
    activeTipe === 'all' ? undefined : activeTipe,
    1, // Always fetch page 1 — infinite scroll handles subsequent pages.
    q,
  );

  const products = catalog?.data ?? [];
  const meta = catalog?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: 9,
    total: 0,
  };

  // filterKey — serialized filter params (no page). Dipakai oleh DevelopGrid
  // untuk reset state saat filter berubah + untuk fetch halaman berikutnya.
  const filterKeyParams = new URLSearchParams();
  if (activeTipe !== 'all') filterKeyParams.set('tipe', activeTipe);
  if (q) filterKeyParams.set('q', q);
  const filterKey = filterKeyParams.toString();

  return (
    <>
      {/* ───── 1. HEADER ───── */}
      <PageHeader
        eyebrow={t('eyebrow')}
        title="Develop"
        subtitle={t('listSubtitle')}
      />

      {/* ───── 2. FILTER PILLS (left) + SEARCH (right) ───── */}
      <SectionBand>
        <SectionContainer py="sm" className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Filter pills */}
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow as="span" size="label-sm" color="ink-muted" className="mr-2">
              {t('filterLabel')}
            </Eyebrow>
            {FILTER_PILLS.map((pill) => {
              const isActive = pill.value === activeTipe;
              const params = new URLSearchParams();
              if (pill.value !== 'all') params.set('tipe', pill.value);
              if (q) params.set('q', q);
              const href = params.toString()
                ? `/develop?${params.toString()}`
                : '/develop';
              return (
                <Button
                  key={pill.value}
                  variant={isActive ? 'ink' : 'surface'}
                  size="sm"
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className="inline-flex items-center"
                >
                  {t(pill.key)}
                </Button>
              );
            })}
            <Eyebrow as="span" size="label-sm" color="ink-muted" className="ml-2">
              {t('items', { count: meta.total })}
            </Eyebrow>
          </div>

          {/* Search bar — right */}
          <div className="w-full lg:w-80 lg:shrink-0">
            <SearchBar
              defaultValue={q ?? ''}
              variant="default"
              basePath="/develop"
              placeholder={t('searchPlaceholder')}
              submitLabel={t('search')}
              showIcon={false}
            />
          </div>
        </SectionContainer>
      </SectionBand>

      {/* ───── 3. ASYMMETRIC GRID + INFINITE SCROLL ───── */}
      {products.length === 0 ? (
        <SectionBand>
          <SectionContainer py="xl" className="text-center">
            <p className="font-display text-headline-md uppercase text-ink/60 mb-6">
              {q ? t('noResults', { query: q }) : t('empty')}
            </p>
            <p className="font-body text-body-md text-ink/60 max-w-md mx-auto mb-8">
              {q ? t('noResultsHint') : t('emptyHint')}
            </p>
            {/*
              Tombol "View All" mengarah ke '/' (homepage) saat katalog kosong,
              supaya tidak mengarah ke dirinya sendiri. Saat ada query (noResults),
              tombol "Reset Search" mengarah ke /develop untuk hapus query string.
             */}
            <Button
              href={q ? '/develop' : '/'}
              variant="primary"
              size="md"
            >
              {q ? t('resetSearch') : t('viewAll')}
            </Button>
          </SectionContainer>
        </SectionBand>
      ) : (
        <SectionBand>
          <SectionContainer py="md">
            <DevelopGrid
              initialProducts={products}
              initialMeta={meta}
              filterKey={filterKey}
            />
          </SectionContainer>
        </SectionBand>
      )}

      {/* ───── 4. FOOTER TEASER ───── */}
      <section className="bg-primary text-surface">
        <SectionContainer py="lg" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <SectionIntro eyebrow={t('footerEyebrow')}>
              <h2 className="font-display text-3xl md:text-5xl font-black uppercase leading-tight">
                {t('footerTitle')}
              </h2>
            </SectionIntro>
          </div>
          <NLink
            href="/display"
            variant="on-dark"
            underline="static"
            arrow
            className="font-label text-label-sm uppercase font-bold text-2xl md:text-3xl whitespace-nowrap"
          >
            {t('footerCta')}
          </NLink>
        </SectionContainer>
      </section>
    </>
  );
}
import { buildMetadata } from '@/lib/seo';
