'use server';

import { revalidatePath } from 'next/cache';
import { apiDelete, apiPatch } from '@/lib/api';

export async function toggleReviewPublishAction(id: number, isPublished: boolean) {
  try {
    await apiPatch(`/api/admin/reviews/${id}`, { is_published: isPublished });
    revalidatePath('/admin/reviews');
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Gagal mengubah status publikasi ulasan.' };
  }
}

export async function deleteReviewAction(id: number) {
  try {
    await apiDelete(`/api/admin/reviews/${id}`);
    revalidatePath('/admin/reviews');
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Gagal menghapus ulasan.' };
  }
}
