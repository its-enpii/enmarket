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

import Link from 'next/link';
import type { Metadata } from 'next';

import { DevelopGrid } from '@/components/public/DevelopGrid';
import { SearchBar } from '@/components/public/SearchBar';
import { Button, NLink } from '@/components/ui/neobrutal';
import { publicApi, PublicFetchError } from '@/lib/public-api';
import type { PaginatedResponse, Product } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Develop — enpiistudio',
  description:
    'Curated collection karya digital dari studio enpii — tools, systems, dan products. Bukan katalog toko; ini rak studio.',
  alternates: { canonical: '/develop' },
};

// ───── Constants ─────

const VALID_TIPE = ['download', 'license', 'bundle'] as const;
type Tipe = (typeof VALID_TIPE)[number];

interface PageProps {
  searchParams: Promise<{ tipe?: string; page?: string; q?: string }>;
}

// Filter pills — All + tipe. Tipe labels pakai tone editorial.
const FILTER_PILLS: Array<{ label: string; value: 'all' | Tipe }> = [
  { label: 'All', value: 'all' },
  { label: 'Apps', value: 'download' },
  { label: 'Templates', value: 'license' },
  { label: 'Bundles', value: 'bundle' },
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
      <section className="border-b-4 border-ink">
        <div className="px-6 md:px-12 py-20 md:py-28">
          <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-6">
            ✎ Develop
          </p>
          <h1 className="font-display text-7xl md:text-9xl font-black uppercase leading-[0.9] tracking-tight text-ink">
            Develop<span className="text-primary">.</span>
          </h1>
          <p className="mt-8 font-body text-body-lg italic text-ink/80 max-w-2xl border-l-4 border-accent pl-6">
            Things I've built — tools, systems, and products from the studio.
            Bukan rak toko. Ini catatan kerja yang kebetulan bisa dibeli.
          </p>
        </div>
      </section>

      {/* ───── 2. FILTER PILLS (left) + SEARCH (right) ───── */}
      <section className="border-b-4 border-ink bg-surface">
        <div className="px-6 md:px-12 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Filter pills */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/60 mr-2">
              Filter →
            </span>
            {FILTER_PILLS.map((pill) => {
              const isActive = pill.value === activeTipe;
              const params = new URLSearchParams();
              if (pill.value !== 'all') params.set('tipe', pill.value);
              if (q) params.set('q', q);
              const href = params.toString()
                ? `/develop?${params.toString()}`
                : '/develop';
              return (
                <Link
                  key={pill.value}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'inline-flex items-center px-4 py-2 font-label text-label-sm uppercase font-bold border-2 transition-all min-h-[40px]',
                    isActive
                      ? 'bg-ink text-surface border-ink shadow-[3px_3px_0_0_var(--color-accent)]'
                      : 'bg-surface text-ink border-ink hover:bg-accent hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-ink)]',
                  ].join(' ')}
                >
                  {pill.label}
                </Link>
              );
            })}
            <span className="ml-2 font-label text-label-sm uppercase tracking-[0.2em] text-ink/60">
              {meta.total} {meta.total === 1 ? 'artifact' : 'artifacts'}
            </span>
          </div>

          {/* Search bar — right */}
          <div className="w-full lg:w-80 lg:shrink-0">
            <SearchBar
              defaultValue={q ?? ''}
              variant="default"
              basePath="/develop"
              placeholder="Cari artifact…"
              submitLabel="Cari"
              showIcon={false}
            />
          </div>
        </div>
      </section>

      {/* ───── 3. ASYMMETRIC GRID + INFINITE SCROLL ───── */}
      {products.length === 0 ? (
        <section className="px-6 md:px-12 py-24 text-center border-b-4 border-ink">
          <p className="font-display text-headline-md uppercase text-ink/60 mb-6">
            {q ? `Tidak ada hasil untuk "${q}"` : 'Belum ada artifact di rak ini.'}
          </p>
          <p className="font-body text-body-md text-ink/60 max-w-md mx-auto mb-8">
            {q
              ? 'Coba kata kunci lain — atau reset filter di bawah.'
              : 'Karya pertama biasanya rilis setelah cukup banyak prototype dibuang. Sabar — atau cek kategori lain.'}
          </p>
          <Button href="/develop" variant="primary" size="md">
            {q ? 'Reset Search' : 'Lihat Semua'}
          </Button>
        </section>
      ) : (
        <section className="border-b-4 border-ink">
          <div className="px-6 md:px-12 py-12 md:py-16">
            <DevelopGrid
              initialProducts={products}
              initialMeta={meta}
              filterKey={filterKey}
            />
          </div>
        </section>
      )}

      {/* ───── 4. FOOTER TEASER ───── */}
      <section className="bg-primary text-surface">
        <div className="px-6 md:px-12 py-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-3">
              ✎ Penasaran prosesnya?
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-black uppercase leading-tight">
              Curious how these{' '}
              <span className="inline-block bg-accent text-ink px-2 py-0.5 -rotate-1">
                are made
              </span>
              ?
            </h2>
          </div>
          <NLink
            href="/display"
            variant="on-dark"
            underline="static"
            arrow
            className="font-label text-label-sm uppercase font-bold text-2xl md:text-3xl whitespace-nowrap"
          >
            Read the process
          </NLink>
        </div>
      </section>
    </>
  );
}