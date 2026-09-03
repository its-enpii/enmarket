import { publicApi } from '@/lib/public-api';
import { getTranslations } from 'next-intl/server';

import { FeaturedSection } from '@/components/public/FeaturedSection';
import { JournalSection } from '@/components/public/JournalSection';
import { Hero } from '@/components/public/Hero';
import { PillarsSection } from '@/components/public/PillarsSection';
import { SponsorsSection } from '@/components/public/SponsorsSection';
import type { Post } from '@/lib/types';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common.site' });
  return {
    ...buildMetadata({
      title: t('title'),
      description: t('description'),
    }),
    alternates: { canonical: `/${locale}` },
  };
}

// Wrapper local: fetch dengan fallback aman — biar section tidak hilang
// kalau API down/error. Fallback = array kosong (section tetap render
// dengan placeholder statis masing-masing).
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.warn(
      'Home: fetch section gagal',
      e instanceof Error ? e.message : String(e),
    );
    return fallback;
  }
}

export default async function HomePage() {
  const [homepageResp, latestPostsResp, siteConfigResp] = await Promise.all([
    safe(() => publicApi.homepageProducts(6), { data: [] }),
    safe(() => publicApi.latestPosts(2), { data: [] }),
    safe(() => publicApi.siteConfig(), {
      data: {
        studio_name: null,
        tagline: null,
        logo_url: null,
        social: [],
        footer: { text: null },
        payment_gateways: {
          tripay: { enabled: true },
          duitku: { enabled: false },
        },
        nav_menus: [],
        sponsors: [],
      },
    }),
  ]);

  // Server sudah dedup (featured-first ordering, max 6 row).
  const productsForFeatured = homepageResp.data ?? [];

  const recentPosts: Post[] = latestPostsResp.data ?? [];

  const sponsors = siteConfigResp.data?.sponsors ?? [];

  return (
    <>
      <Hero />
      <PillarsSection />
      <FeaturedSection products={productsForFeatured} />
      <SponsorsSection sponsors={sponsors} />
      <JournalSection posts={recentPosts} />
    </>
  );
}
