'use server';

/**
 * Server actions untuk CRUD blog post.
 * Pattern: persis categories/actions.ts — pakai `apiPostForm` / `apiPutForm` untuk
 * multipart (content + thumbnail dalam satu FormData), `apiDelete` untuk hapus.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { ApiRequestError, apiDelete, apiPostForm, apiPutForm } from '@/lib/api';

export interface ActionResult {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function pickFieldError(err: ApiRequestError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  if (err.body?.errors) {
    for (const [k, v] of Object.entries(err.body.errors)) {
      if (v?.[0]) out[k] = [v[0]];
    }
  }
  return out;
}

// ───── Create ─────
export async function createPost(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const res = await apiPostForm<{ data: { id: number } }>(
      '/api/admin/posts',
      formData,
    );
    const newId = res.data.id;

    revalidatePath('/admin/posts');
    revalidatePath('/admin');
    redirect(`/admin/posts/${newId}`);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: err.body?.message ?? `HTTP ${err.status}`,
        fieldErrors: pickFieldError(err),
      };
    }
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
    return { error: 'Gagal membuat catatan.' };
  }
  return {};
}

// ───── Update ─────
export async function updatePost(
  id: number,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiPutForm(`/api/admin/posts/${id}`, formData);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: err.body?.message ?? `HTTP ${err.status}`,
        fieldErrors: pickFieldError(err),
      };
    }
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
    return { error: 'Gagal memperbarui catatan.' };
  }

  revalidatePath('/admin/posts');
  revalidatePath(`/admin/posts/${id}`);
  revalidatePath('/admin');
  redirect(`/admin/posts/${id}`);
}

// ───── Delete ─────
export async function deletePost(formData: FormData): Promise<void> {
  const id = formData.get('id')?.toString();
  if (!id) return;

  try {
    await apiDelete(`/api/admin/posts/${id}`);
  } catch (err) {
    console.error('Delete post failed:', err);
  }

  revalidatePath('/admin/posts');
}
