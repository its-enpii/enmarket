'use server';

import { loadAllMedia, type MediaItem } from '@/lib/media';

/**
 * Server action untuk fetch daftar media library (products + posts).
 * Dipakai oleh MediaPickerModal component.
 */
export async function fetchMediaLibrary(): Promise<MediaItem[]> {
  try {
    return await loadAllMedia();
  } catch (err) {
    console.error('Failed to fetch media library:', err);
    return [];
  }
}