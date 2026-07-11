/**
 * Media library types + filter helpers — CLIENT-SAFE (no apiGet import).
 *
 * Dipakai di client components (MediaGallery, dll). Server-only helper
 * `loadAllMedia()` ada di `@/lib/media-server` (import next/headers).
 */

export type MediaSource = 'product' | 'post';

export interface MediaItem {
  url: string;
  filename: string;
  mime: string;
  type: 'image' | 'video' | 'other';
  source: MediaSource;
  sourceId: number;
  sourceLabel: string;
  createdAt: string | null;
}

/**
 * Derive filename/mime/type dari URL. Pure — no I/O. Bisa dipanggil di client.
 */
export function deriveMediaMeta(url: string): {
  filename: string;
  mime: string;
  type: MediaItem['type'];
} {
  const clean = url.split('?')[0].split('#')[0];
  const lastSlash = clean.lastIndexOf('/');
  const raw = lastSlash >= 0 ? clean.slice(lastSlash + 1) : clean;
  const filename = decodeURIComponent(raw) || 'untitled';

  const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg|bmp|ico)$/i;
  const VIDEO_EXT = /\.(mp4|webm|mov|avi|mkv)$/i;

  let mime = 'application/octet-stream';
  let type: MediaItem['type'] = 'other';
  if (IMAGE_EXT.test(filename)) {
    mime = `image/${filename.split('.').pop()?.toLowerCase() ?? 'jpeg'}`;
    type = 'image';
  } else if (VIDEO_EXT.test(filename)) {
    mime = `video/${filename.split('.').pop()?.toLowerCase() ?? 'mp4'}`;
    type = 'video';
  }
  return { filename, mime, type };
}

export interface FilterMediaOptions {
  q?: string;
  source?: MediaSource | 'all';
  type?: MediaItem['type'] | 'all';
}

export function filterMedia(items: MediaItem[], opts: FilterMediaOptions): MediaItem[] {
  return items.filter((item) => {
    if (opts.source && opts.source !== 'all' && item.source !== opts.source) return false;
    if (opts.type && opts.type !== 'all' && item.type !== opts.type) return false;
    if (opts.q && !item.filename.toLowerCase().includes(opts.q.toLowerCase())) return false;
    return true;
  });
}