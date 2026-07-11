'use server';

/**
 * Server actions untuk CRUD produk.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { ApiRequestError, apiDelete, apiPost, apiPostForm, apiPutForm } from '@/lib/api';

export interface ActionResult {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ───── Helpers ─────
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
export async function createProduct(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    // Forward multipart ke Laravel
    const res = await apiPostForm<{ data: { id: number } }>(
      '/api/admin/products',
      formData,
    );
    const newId = res.data.id;

    revalidatePath('/admin/products');
    revalidatePath('/admin');
    redirect(`/admin/products/${newId}`);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: err.body?.message ?? `HTTP ${err.status}`,
        fieldErrors: pickFieldError(err),
      };
    }
    // redirect() throws NEXT_REDIRECT — biar lewat
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
    return { error: 'Gagal membuat produk.' };
  }
  return {};
}

// ───── Update ─────
export async function updateProduct(
  id: number,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await apiPutForm(`/api/admin/products/${id}`, formData);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: err.body?.message ?? `HTTP ${err.status}`,
        fieldErrors: pickFieldError(err),
      };
    }
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
    return { error: 'Gagal memperbarui produk.' };
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
  revalidatePath('/admin');
  redirect(`/admin/products/${id}`);
}

// ───── Delete ─────
export async function deleteProduct(formData: FormData): Promise<void> {
  const id = formData.get('id')?.toString();
  if (!id) return;

  try {
    await apiDelete(`/api/admin/products/${id}`);
  } catch (err) {
    console.error('Delete product failed:', err);
  }

  revalidatePath('/admin/products');
}