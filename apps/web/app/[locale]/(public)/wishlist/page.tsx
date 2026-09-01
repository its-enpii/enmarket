import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { EmptyState } from '@/components/public/EmptyState';
import { ProductGrid } from '@/components/public/ProductGrid';
import { wishlistApi, PublicFetchError } from '@/lib/wishlist-api';
import { buildMetadata } from '@/lib/seo';
import { Eyebrow } from '@/components/ui/neobrutal';
import { PageTitle, SectionIntro } from '@/components/ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wishlist' });
  return {
    ...buildMetadata({
      title: `${t('title')} — enpiistudio`,
      description: t('title'),
    }),
    alternates: { canonical: `/${locale}/wishlist` },
  };
}

export default async function WishlistPage() {
  const t = await getTranslations('wishlist');
  const tKatalog = await getTranslations('katalog');

  let items: Awaited<ReturnType<typeof wishlistApi.get>>['data'] = [];

  try {
    const res = await wishlistApi.get();
    items = res.data ?? [];
  } catch (err) {
    if (!(err instanceof PublicFetchError)) {
      console.warn('Wishlist fetch error:', err);
    }
  }

  const products = items.map((item) => item.product).filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-12">
      {/* Page header */}
      <div className="mb-8 border-b-4 border-ink pb-6">
        <SectionIntro eyebrow={<>♥ {t('title')}</>}>
          ♥ {t('title')}
        </SectionIntro>
        <PageTitle size="hero">
          {t('title')}<span className="text-primary">.</span>
        </PageTitle>
        <p className="mt-3 text-sm text-ink/60 max-w-2xl">
          {products.length} {tKatalog('itemsSuffix')}
        </p>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title={t('empty')}
          message={t('empty')}
          cta={{ href: '/katalog', label: `${t('cta')} →` }}
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
