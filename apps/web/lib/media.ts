/**
 * Media library — SERVER-only helpers (import apiGet → next/headers).
 *
 * Re-export dari sini ke caller yang butuh server-side fetch. Untuk type
 * & filter (client-safe) pakai `@/lib/media-shared` direct.
 */

import { apiGet } from '@/lib/api';
import {
  deriveMediaMeta,
  type MediaItem,
} from './media-shared';
import type { PaginatedResponse, Post, Product } from './types';

/**
 * Scan all products (up to per_page=100) + posts (up to 100) → flatten to
 * MediaItem[]. Dedup by URL (some products may use the same image).
 */
export async function loadAllMedia(): Promise<MediaItem[]> {
  const [productsRes, postsRes] = await Promise.all([
    apiGet<PaginatedResponse<Product>>('/api/admin/products', { per_page: 100 }).catch(() => ({
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 100, total: 0 },
    })),
    apiGet<PaginatedResponse<Post>>('/api/admin/posts', { per_page: 100 }).catch(() => ({
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 100, total: 0 },
    })),
  ]);

  const items: MediaItem[] = [];
  const seen = new Set<string>();

  for (const p of productsRes.data ?? []) {
    for (const url of p.preview_images ?? []) {
      if (seen.has(url)) continue;
      seen.add(url);
      const meta = deriveMediaMeta(url);
      items.push({
        url,
        ...meta,
        source: 'product',
        sourceId: p.id,
        sourceLabel: p.nama,
        createdAt: p.created_at,
      });
    }
  }

  for (const post of postsRes.data ?? []) {
    if (!post.thumbnail) continue;
    if (seen.has(post.thumbnail)) continue;
    seen.add(post.thumbnail);
    const meta = deriveMediaMeta(post.thumbnail);
    items.push({
      url: post.thumbnail,
      ...meta,
      source: 'post',
      sourceId: post.id,
      sourceLabel: post.title,
      createdAt: post.published_at ?? post.created_at,
    });
  }

  return items;
}

// Re-export client-safe types/helpers untuk konsistensi import.
export type { MediaItem, FilterMediaOptions, MediaSource } from './media-shared';
export { filterMedia, deriveMediaMeta } from './media-shared';