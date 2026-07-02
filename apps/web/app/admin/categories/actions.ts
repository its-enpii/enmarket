'use server';

/**
 * Server actions untuk CRUD kategori.
 * Lempar error dengan pesan dari API, frontend tangkap via useActionState.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { ApiRequestError, apiDelete, apiPost, apiPut } from '@/lib/api';

export interface ActionResult {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ───── Create ─────
export async function createCategory(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const nama = formData.get('nama')?.toString() ?? '';
  const slug = formData.get('slug')?.toString() ?? '';
  const deskripsi = formData.get('deskripsi')?.toString() ?? '';

  try {
    await apiPost('/api/admin/categories', {
      nama,
      slug: slug || undefined,
      deskripsi: deskripsi || null,
    });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: err.body?.message ?? `HTTP ${err.status}`,
        fieldErrors: err.body?.errors,
      };
    }
    return { error: 'Gagal menyimpan kategori.' };
  }

  revalidatePath('/admin/categories');
  redirect('/admin/categories');
}

// ───── Update ─────
export async function updateCategory(
  id: number,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const nama = formData.get('nama')?.toString() ?? '';
  const slug = formData.get('slug')?.toString() ?? '';
  const deskripsi = formData.get('deskripsi')?.toString() ?? '';

  try {
    await apiPut(`/api/admin/categories/${id}`, {
      nama,
      slug: slug || undefined,
      deskripsi: deskripsi || null,
    });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: err.body?.message ?? `HTTP ${err.status}`,
        fieldErrors: err.body?.errors,
      };
    }
    return { error: 'Gagal memperbarui kategori.' };
  }

  revalidatePath('/admin/categories');
  redirect('/admin/categories');
}

// ───── Delete ─────
export async function deleteCategory(formData: FormData): Promise<void> {
  const id = formData.get('id')?.toString();
  if (!id) return;

  try {
    await apiDelete(`/api/admin/categories/${id}`);
  } catch (err) {
    // Tulis ke console — caller pakai window.location.reload? Tidak ideal
    // tanpa return value ke client component. Untuk sekarang redirect
    // ke halaman kategori; flash message bisa ditambah nanti.
    console.error('Delete category failed:', err);
  }

  revalidatePath('/admin/categories');
}