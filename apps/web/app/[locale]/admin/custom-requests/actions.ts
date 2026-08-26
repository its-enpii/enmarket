'use server';

import { revalidatePath } from 'next/cache';
import { ApiRequestError, apiPatch } from '@/lib/api';

export interface UpdateCustomRequestResult {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
}

export async function updateCustomRequestAction(
  id: number,
  _prev: UpdateCustomRequestResult,
  formData: FormData,
): Promise<UpdateCustomRequestResult> {
  const status = formData.get('status')?.toString();
  const notes = formData.get('notes')?.toString();

  try {
    await apiPatch(`/api/admin/custom-requests/${id}`, {
      status,
      notes: notes || null,
    });
    revalidatePath(`/admin/custom-requests/${id}`);
    revalidatePath('/admin/custom-requests');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: err.body?.message ?? `HTTP ${err.status}`,
        fieldErrors: err.body?.errors,
      };
    }
    return { error: 'Gagal memperbarui status permintaan.' };
  }
}
