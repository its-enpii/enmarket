'use server';

import { revalidatePath } from 'next/cache';

import { ApiRequestError, apiDelete, apiPost, apiPut } from '@/lib/api';
import type { ActionResult } from '@/lib/action-result';
import type { SingleResponse } from '@/lib/types';

export type { ActionResult };

export interface MetadataResult {
  name: string;
  url: string;
  logo_url: string | null;
  fetched_description: string | null;
  fetched_at: string | null;
}

export async function fetchMetadataAction(
  domain: string,
): Promise<{ ok: boolean; data?: MetadataResult; error?: string }> {
  try {
    const res = await apiPost<SingleResponse<MetadataResult>>(
      '/api/admin/sponsors/fetch-metadata',
      { domain },
    );
    return { ok: true, data: res.data };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { ok: false, error: err.body?.message ?? `HTTP ${err.status}` };
    }
    return { ok: false, error: 'Gagal mengambil metadata.' };
  }
}

export async function createSponsor(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const domain = formData.get('domain')?.toString() ?? '';
  const name = formData.get('name')?.toString() ?? '';
  const url = formData.get('url')?.toString() ?? '';
  const logo_url = formData.get('logo_url')?.toString() ?? '';
  const description = formData.get('description')?.toString() ?? '';
  const amount = formData.get('amount')?.toString() ?? '';
  const is_active =
    formData.get('is_active') === 'on' ||
    formData.get('is_active') === 'true' ||
    formData.get('is_active') === '1';

  try {
    await apiPost('/api/admin/sponsors', {
      domain,
      name: name || undefined,
      url: url || undefined,
      logo_url: logo_url || undefined,
      description: description || undefined,
      amount: amount ? Number(amount) : undefined,
      is_active,
    });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: err.body?.message ?? `HTTP ${err.status}`,
        fieldErrors: err.body?.errors,
      };
    }
    return { error: 'Gagal menyimpan sponsor.' };
  }

  revalidatePath('/admin/sponsors');
  revalidatePath('/');
  return {
    ok: true,
    message: 'Sponsor berhasil ditambahkan.',
    redirectTo: '/admin/sponsors',
  };
}

export async function updateSponsor(
  id: number,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const domain = formData.get('domain')?.toString() ?? '';
  const name = formData.get('name')?.toString() ?? '';
  const url = formData.get('url')?.toString() ?? '';
  const logo_url = formData.get('logo_url')?.toString() ?? '';
  const description = formData.get('description')?.toString() ?? '';
  const amount = formData.get('amount')?.toString() ?? '';
  const is_active =
    formData.get('is_active') === 'on' ||
    formData.get('is_active') === 'true' ||
    formData.get('is_active') === '1';

  try {
    await apiPut(`/api/admin/sponsors/${id}`, {
      domain,
      name: name || undefined,
      url: url || undefined,
      logo_url: logo_url || null,
      description: description || null,
      amount: amount ? Number(amount) : undefined,
      is_active,
    });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: err.body?.message ?? `HTTP ${err.status}`,
        fieldErrors: err.body?.errors,
      };
    }
    return { error: 'Gagal memperbarui sponsor.' };
  }

  revalidatePath('/admin/sponsors');
  revalidatePath('/');
  return {
    ok: true,
    message: 'Sponsor berhasil diperbarui.',
    redirectTo: '/admin/sponsors',
  };
}

export async function deleteSponsor(
  formData: FormData,
): Promise<{ ok?: boolean; error?: string; message?: string }> {
  const id = formData.get('id')?.toString();
  if (!id) return { error: 'ID sponsor tidak valid.' };

  try {
    await apiDelete(`/api/admin/sponsors/${id}`);
    revalidatePath('/admin/sponsors');
    revalidatePath('/');
    return { ok: true, message: 'Sponsor berhasil dihapus.' };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { error: err.body?.message ?? `HTTP ${err.status}` };
    }
    return { error: 'Gagal menghapus sponsor.' };
  }
}
