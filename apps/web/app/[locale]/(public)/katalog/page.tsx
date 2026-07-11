import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { CategoryFilter } from '@/components/public/CategoryFilter';
import { EmptyState } from '@/components/public/EmptyState';
import { Pagination } from '@/components/public/Pagination';
import { ProductGrid } from '@/components/public/ProductGrid';
import { SearchBar } from '@/components/public/SearchBar';
import { publicApi, PublicFetchError } from '@/lib/public-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string; tipe?: string; page?: string }>;
}

const VALID_TIPE = ['download', 'license', 'bundle'] as const;
type Tipe = (typeof VALID_TIPE)[number];

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'katalog' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: { canonical: `/${locale}/katalog` },
  };
}

export default async function CatalogPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations('katalog');
  const tCommon = await getTranslations('common.buttons');

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

  const heading = category
    ? `${t('categoryLabel')}: ${categoriesData.find((c) => c.slug === category)?.nama ?? category}`
    : q
      ? `${t('searchLabel')}: "${q}"`
      : tipe
        ? `${tCommon('filter')}: ${t(`tipe.${tipe}` as 'tipe.download' | 'tipe.license' | 'tipe.bundle' | never)}`
        : t('title');

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-ink">{t('title')}</h1>
        <p className="mt-2 text-sm sm:text-base text-ink/70">
          {heading}{meta.total > 0 && (
            <span className="text-ink/50"> · {meta.total} {t('itemsSuffix')}</span>
          )}
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
              title={q ? `"${q}" ${t('noResults')}` : t('empty')}
              message={
                q || category || tipe
                  ? t('resetFilterHint')
                  : t('adminHint')
              }
              cta={
                q || category || tipe
                  ? { href: '/katalog', label: tCommon('reset') }
                  : { href: '/login', label: t('loginAdmin') }
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