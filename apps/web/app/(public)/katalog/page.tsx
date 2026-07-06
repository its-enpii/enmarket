import type { Metadata } from 'next';

import { CategoryFilter } from '@/components/public/CategoryFilter';
import { EmptyState } from '@/components/public/EmptyState';
import { Pagination } from '@/components/public/Pagination';
import { ProductGrid } from '@/components/public/ProductGrid';
import { SearchBar } from '@/components/public/SearchBar';
import { publicApi, PublicFetchError } from '@/lib/public-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Karya — enpiistudio',
  description: 'Jelajahi karya enpiistudio. Filter berdasarkan tipe atau cari karya spesifik.',
  alternates: { canonical: '/katalog' },
};

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string; tipe?: string; page?: string }>;
}

const VALID_TIPE = ['download', 'license', 'bundle'] as const;
type Tipe = (typeof VALID_TIPE)[number];

const TIPE_LABEL: Record<Tipe, string> = {
  download: 'Source Code',
  license: 'Lisensi',
  bundle: 'Bundle',
};

export default async function CatalogPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const category = typeof sp.category === 'string' ? sp.category : undefined;
  const q = typeof sp.q === 'string' ? sp.q : undefined;
  const tipe: Tipe | undefined =
    typeof sp.tipe === 'string' && VALID_TIPE.includes(sp.tipe as Tipe)
      ? (sp.tipe as Tipe)
      : undefined;
  const pageNum = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);

  let catalogData: Awaited<ReturnType<typeof publicApi.catalog>> | null = null;
  let categoriesData: Awaited<ReturnType<typeof publicApi.categories>>['data'] = [];

  try {
    const [catalog, categories] = await Promise.all([
      publicApi.catalog({ category, q, tipe, page: pageNum }),
      publicApi.categories(),
    ]);
    catalogData = catalog;
    categoriesData = categories.data ?? [];
  } catch (err) {
    if (err instanceof PublicFetchError && err.status === 404) {
      catalogData = { data: [], meta: { current_page: 1, last_page: 1, per_page: 12, total: 0 } };
    } else {
      throw err;
    }
  }

  const products = catalogData?.data ?? [];
  const meta = catalogData?.meta ?? { current_page: 1, last_page: 1, per_page: 12, total: 0 };

  // Page heading — berdasarkan filter
  const heading = category
    ? `Kategori: ${categoriesData.find((c) => c.slug === category)?.nama ?? category}`
    : q
      ? `Hasil pencarian: "${q}"`
      : tipe
        ? `Karya: ${TIPE_LABEL[tipe]}`
        : 'Semua Karya';

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-ink">Karya</h1>
        <p className="mt-2 text-sm sm:text-base text-ink/70">
          {heading} {meta.total > 0 && <span className="text-ink/50">· {meta.total} karya</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-6">
        <div className="space-y-4">
          <SearchBar defaultValue={q ?? ''} variant="compact" />
          <CategoryFilter categories={categoriesData} activeSlug={category} />
        </div>

        <div>
          {products.length === 0 ? (
            <EmptyState
              title={q ? `Tidak ada hasil untuk "${q}"` : 'Belum ada karya'}
              message={
                q || category || tipe
                  ? 'Coba ubah filter atau kata kunci pencarian.'
                  : 'Tambahkan karya dari dashboard admin untuk memulai.'
              }
              cta={
                q || category || tipe
                  ? { href: '/katalog', label: 'Reset Filter' }
                  : { href: '/login', label: 'Login Admin' }
              }
            />
          ) : (
            <>
              <ProductGrid products={products} />
              <Pagination
                meta={meta}
                basePath="/katalog"
                searchParams={{
                  ...(category ? { category } : {}),
                  ...(q ? { q } : {}),
                  ...(tipe ? { tipe } : {}),
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}