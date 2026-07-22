import { publicApi } from '@/lib/public-api';
import { getTranslations } from 'next-intl/server';

import { FeaturedSection } from '@/components/public/FeaturedSection';
import { JournalSection } from '@/components/public/JournalSection';
import { Hero } from '@/components/public/Hero';
import { PillarsSection } from '@/components/public/PillarsSection';
import type { Post } from '@/lib/types';

/*
 * Homepage — Neobrutalism enpiistudio.
 *
 * Sesuai rebrand & mockup:
 *   - Hero (monolitik, "DISCOVER, DEVELOP, DISPLAY")
 *   - Pillars (Discover / Develop / Display 2+1 layout)
 *   - Featured Developments (zig-zag 4-item)
 *   - Latest / Display (journal 2-entry alternating)
 *
 * Komponen lama yang sudah digantikan & tidak dipanggil lagi dari homepage
 * (tetap ada di disk untuk reuse admin/display lain):
 *   - MarqueeStrip, StatsBar, CategoryRail, TrendingSection, TrustSection,
 *     NewsletterCTA, PromoBanner.
 *
 * Build container tidak punya akses ke service `api` (compose DNS runtime
 * only), jadi tetap `dynamic = 'force-dynamic'`. ISR via webhook revalidate.
 *
 * Layout structure:
 *   - <main> di PublicLayout → max-w-container-max sudah di-handle parent
 *     (TopNav, Footer). Sections di sini dibuat full-width dengan
 *     px-6/md:px-12 padding KONSISTEN — sehingga column edges sejajar
 *     dengan TopNav/Footer di semua breakpoint.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common.site' });
  return {
    title: t('title'),
    description: t('description'),
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
  const [homepageResp, latestPostsResp] = await Promise.all([
    safe(() => publicApi.homepageProducts(6), { data: [] }),
    safe(() => publicApi.latestPosts(2), { data: [] }),
  ]);

  // Server sudah dedup (featured-first ordering, max 6 row).
  const productsForFeatured = homepageResp.data ?? [];

  const recentPosts: Post[] = latestPostsResp.data ?? [];

  return (
    <>
      <Hero />
      <PillarsSection />
      <FeaturedSection products={productsForFeatured} />
      <JournalSection posts={recentPosts} />
    </>
  );
}
