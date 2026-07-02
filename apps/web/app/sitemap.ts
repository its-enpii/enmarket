import type { MetadataRoute } from 'next';

import { publicApi, PublicFetchError } from '@/lib/public-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * sitemap.xml — generated dari API publik Laravel.
 * Termasuk halaman statis + semua produk aktif + kategori.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/katalog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
  ];

  let productUrls: MetadataRoute.Sitemap = [];
  let categoryUrls: MetadataRoute.Sitemap = [];

  try {
    const [products, categories] = await Promise.all([
      publicApi.productSlugs(),
      publicApi.categorySlugs(),
    ]);
    productUrls = (products.data ?? []).map((slug) => ({
      url: `${baseUrl}/produk/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
    categoryUrls = (categories.data ?? []).map((slug) => ({
      url: `${baseUrl}/c/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch (err) {
    if (!(err instanceof PublicFetchError)) throw err;
    console.warn('sitemap: gagal fetch slugs', err.message);
  }

  return [...staticPages, ...categoryUrls, ...productUrls];
}