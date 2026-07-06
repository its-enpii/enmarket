/**
 * Server-side fetch helper untuk endpoint publik Laravel.
 *
 * - Tidak butuh auth — endpoint publik.
 * - Pakai `cache: 'no-store'` (SSR) + page-level `dynamic = 'force-dynamic'`.
 *   ISR diaktifkan via webhook revalidate (revalidatePath) saat admin CRUD.
 * - Throw pada error agar Server Component bisa fallback ke notFound().
 */

import type { Category, PaginatedResponse, Product } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api:8000';
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
  options?: { revalidate?: number },
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

  const revalidate = options?.revalidate ?? 0;
  const res = await fetch(url, {
    cache: 'no-store',
    // revalidate tersedia via opsi kalau page-level tidak force-dynamic
    ...(revalidate > 0
      ? { next: { revalidate } }
      : {}),
  });

  if (!res.ok) {
    throw new PublicFetchError(`Public fetch ${path} failed: HTTP ${res.status}`, res.status);
  }

  return res.json() as Promise<T>;
}

export const publicApi = {
  /** Halaman utama: hingga 6 produk unggulan aktif. */
  featuredProducts: () =>
    publicFetch<{ data: Product[] }>('/api/public/products/featured'),

  /** Halaman utama: 8 produk aktif terbaru. */
  latestProducts: () =>
    publicFetch<{ data: Product[] }>('/api/public/products/latest'),

  /** Katalog publik dengan filter + pagination. */
  catalog: (params: { category?: string; q?: string; tipe?: 'download' | 'license' | 'bundle'; page?: number }) =>
    publicFetch<PaginatedResponse<Product>>('/api/public/products', {
      category: params.category,
      q: params.q,
      tipe: params.tipe,
      page: params.page,
    }),

  /** Homepage: produk berdasarkan tipe (download = source code, license/bundle = karya jadi). */
  productsByType: (params: { tipe: 'download' | 'license' | 'bundle'; per_page?: number }) =>
    publicFetch<PaginatedResponse<Product>>('/api/public/products', {
      tipe: params.tipe,
      per_page: params.per_page ?? 3,
      page: 1,
    }),

  /** Detail produk by slug. 404 → throw PublicFetchError dengan status 404. */
  product: (slug: string) =>
    publicFetch<{ data: Product }>(`/api/public/products/${slug}`),

  /** Daftar kategori yang punya minimal 1 produk aktif. */
  categories: () =>
    publicFetch<{ data: Category[] }>('/api/public/categories'),

  /** Untuk sitemap: list slug semua produk aktif. */
  productSlugs: () =>
    publicFetch<{ data: string[] }>('/api/public/products/slugs'),

  /** Untuk sitemap: list slug semua kategori aktif. */
  categorySlugs: () =>
    publicFetch<{ data: string[] }>('/api/public/categories/slugs'),
};

export { PublicFetchError };