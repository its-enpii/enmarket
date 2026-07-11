import type { MetadataRoute } from 'next';

import { publicApi, PublicFetchError } from '@/lib/public-api';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * sitemap.xml — emit per locale.
 *
 * Untuk SETIAP path yang sama, hasilkan `${baseUrl}/${locale}/path`
 * dengan `alternates.languages` pointing ke versi URL di semua locale lain.
 * Bot search engine memakai ini untuk crawl & serve hreflang.
 */

const STATIC_PATHS = [
  { path: '', priority: 1, changeFrequency: 'daily' as const },
  { path: 'katalog', priority: 0.9, changeFrequency: 'daily' as const },
  { path: 'display', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: 'discover', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: 'develop', priority: 0.7, changeFrequency: 'weekly' as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const now = new Date();

  let dynamicPaths: Array<{ path: string; priority: number; changeFrequency: 'weekly' | 'monthly' }> = [];

  try {
    const [products, categories, posts] = await Promise.all([
      publicApi.productSlugs(),
      publicApi.categorySlugs(),
      publicApi.postSlugs(),
    ]);
    dynamicPaths = [
      ...((products.data ?? []).map((slug) => ({
        path: `develop/${slug}`,
        priority: 0.8,
        changeFrequency: 'weekly' as const,
      }))),
      ...((categories.data ?? []).map((slug) => ({
        path: `c/${slug}`,
        priority: 0.6,
        changeFrequency: 'weekly' as const,
      }))),
      ...((posts.data ?? []).map((slug) => ({
        path: `display/${slug}`,
        priority: 0.6,
        changeFrequency: 'monthly' as const,
      }))),
    ];
  } catch (err) {
    if (!(err instanceof PublicFetchError)) throw err;
    console.warn('sitemap: gagal fetch slugs', err.message);
  }

  // Untuk SETIAP path, emit satu entry per locale, dengan alternates.
  const entries: MetadataRoute.Sitemap = [];
  const allPaths = [...STATIC_PATHS, ...dynamicPaths];

  for (const { path, priority, changeFrequency } of allPaths) {
    // Build alternates object untuk SETIAP locale.
    const languages: Record<string, string> = {};
    for (const loc of routing.locales) {
      languages[loc] = `${baseUrl}/${loc}/${path}`;
    }
    // x-default pakai default locale
    languages['x-default'] = `${baseUrl}/${routing.defaultLocale}/${path}`;

    for (const loc of routing.locales) {
      entries.push({
        url: `${baseUrl}/${loc}/${path}`,
        lastModified: now,
        changeFrequency,
        priority,
        alternates: { languages },
      });
    }
  }

  return entries;
}