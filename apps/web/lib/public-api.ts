/**
 * Server-side fetch helper untuk endpoint publik Laravel.
 *
 * - Tidak butuh auth — endpoint publik.
 * - Pakai Next Data Cache dengan `next: { revalidate, tags }` (ISR-friendly).
 *   Default revalidate 300 detik; `noStore: true` memaksa bypass cache.
 *   ISR juga diaktifkan via webhook revalidate (revalidatePath) saat admin CRUD.
 * - Throw pada error agar Server Component bisa fallback ke notFound().
 */

import type {
  Category,
  PaginatedResponse,
  Post,
  Product,
  PublicSiteConfig,
  TagCount,
} from './types';

import { getApiBase } from './api-base';

const API_URL = getApiBase();
const REVALIDATE_SECONDS = 3600;

class PublicFetchError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'PublicFetchError';
  }
}

async function publicFetch<T>(
  path: string,
  query?: Record<string, string | number | undefined | null>,
  options?: { revalidate?: number; tags?: string[]; noStore?: boolean },
): Promise<T> {
  let url = API_URL + (path.startsWith('/') ? path : `/${path}`);

  if (query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') {
        params.append(k, String(v));
      }
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const revalidate = options?.revalidate ?? 300;
  const tags = options?.tags ?? ['public'];
  const res = await fetch(url, {
    method: 'GET',
    ...(options?.noStore
      ? { cache: 'no-store' as const }
      : { next: { revalidate, tags } }),
  });

  if (!res.ok) {
    throw new PublicFetchError(`Public fetch ${path} failed: HTTP ${res.status}`, res.status);
  }

  return res.json() as Promise<T>;
}

export const publicApi = {
  /** Halaman utama: hingga 6 produk unggulan aktif. */
  featuredProducts: () =>
    publicFetch<{ data: Product[] }>('/api/public/products/featured', undefined, {
      tags: ['products'],
    }),

  /** Halaman utama: 8 produk aktif terbaru. */
  latestProducts: () =>
    publicFetch<{ data: Product[] }>('/api/public/products/latest', undefined, {
      tags: ['products'],
    }),

  /**
   * Homepage: featured + latest digabung TANPA duplikat (server-side dedup).
   * Single round-trip — ganti 2 call (featured + latest) di homepage.
   */
  homepageProducts: (perPage = 6) =>
    publicFetch<{ data: Product[] }>('/api/public/products/homepage', { per_page: perPage }, {
      tags: ['products'],
    }),

  /** Katalog publik dengan filter + pagination. */
  catalog: (params: {
    category?: string;
    q?: string;
    tag?: string;
    tipe?: 'download' | 'license' | 'bundle' | 'account_manual';
    page?: number;
    per_page?: number;
  }) =>
    publicFetch<PaginatedResponse<Product>>('/api/public/products', {
      category: params.category,
      q: params.q,
      tag: params.tag,
      tipe: params.tipe,
      page: params.page,
      per_page: params.per_page,
    }, { tags: ['products'] }),

  /** Homepage: produk berdasarkan tipe (download = source code, license/bundle = karya jadi). */
  productsByType: (params: { tipe: 'download' | 'license' | 'bundle' | 'account_manual'; per_page?: number }) =>
    publicFetch<PaginatedResponse<Product>>('/api/public/products', {
      tipe: params.tipe,
      per_page: params.per_page ?? 3,
      page: 1,
    }, { tags: ['products'] }),

  /** Detail produk by slug. 404 → throw PublicFetchError dengan status 404. */
  product: (slug: string) =>
    publicFetch<{ data: Product }>(`/api/public/products/${slug}`, undefined, {
      tags: ['products', `product:${slug}`],
    }),

  /** Daftar kategori yang punya minimal 1 produk aktif. */
  categories: () =>
    publicFetch<{ data: Category[] }>('/api/public/categories', undefined, {
      tags: ['categories'],
    }),

  /** Untuk sitemap: list slug semua produk aktif. */
  productSlugs: () =>
    publicFetch<{ data: string[] }>('/api/public/products/slugs', undefined, {
      tags: ['products'],
    }),

  /** Untuk sitemap: list slug semua kategori aktif. */
  categorySlugs: () =>
    publicFetch<{ data: string[] }>('/api/public/categories/slugs', undefined, {
      tags: ['categories'],
    }),

  // ───── Blog post (Catatan) ─────

  /** List post published, paginated. Untuk /display. */
  posts: (params?: { q?: string; page?: number; per_page?: number; category?: string; tag?: string }) =>
    publicFetch<PaginatedResponse<Post>>('/api/public/posts', {
      q: params?.q,
      page: params?.page,
      per_page: params?.per_page,
      category: params?.category,
      tag: params?.tag,
    }, { tags: ['posts'] }),

  /** Post published terbaru, tanpa pagination. Untuk homepage Discover. */
  latestPosts: (limit = 3) =>
    publicFetch<{ data: Post[] }>('/api/public/posts/latest', { limit }, {
      tags: ['posts'],
    }),

  /** Detail post by slug. 404 → throw PublicFetchError. */
  post: (slug: string) =>
    publicFetch<{ data: Post }>(`/api/public/posts/${slug}`, undefined, {
      tags: ['posts', `post:${slug}`],
    }),

  /** Untuk sitemap: list slug semua post published. */
  postSlugs: () =>
    publicFetch<{ data: string[] }>('/api/public/posts/slugs', undefined, {
      tags: ['posts'],
    }),

  /** Daftar tag populer per tipe resource (count desc, maks 50). */
  tags: (type: 'post' | 'product') =>
    publicFetch<{ data: TagCount[] }>('/api/public/tags', { type }, { tags: ['tags'] }),

  /** Public site config (identity + social + footer) — aman untuk storefront. */
  siteConfig: () =>
    publicFetch<{ data: PublicSiteConfig }>('/api/public/site-config', undefined, {
      revalidate: REVALIDATE_SECONDS,
      tags: ['site-config'],
    }),
};

export { PublicFetchError };
