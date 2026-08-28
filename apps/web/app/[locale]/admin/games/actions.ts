'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { ApiRequestError, apiDelete, apiPost, apiPatch } from '@/lib/api';

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

export async function createGame(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const body: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) {
    if (k === 'requires_server_id' || k === 'active') {
      body[k] = v === 'true' || v === '1';
    } else if (k === 'sort_order') {
      body[k] = parseInt(v as string, 10) || 0;
    } else {
      body[k] = v;
    }
  }

  try {
    const res = await apiPost<{ data: { id: number } }>('/api/admin/games', body);
    const newId = res.data.id;
    revalidatePath('/admin/games');
    redirect(`/admin/games/${newId}`);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { error: err.body?.message ?? `HTTP ${err.status}`, fieldErrors: pickFieldError(err) };
    }
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
    return { error: 'Gagal membuat game.' };
  }
  return {};
}

export async function updateGame(id: number, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const body: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) {
    if (k === 'requires_server_id' || k === 'active') {
      body[k] = v === 'true' || v === '1';
    } else if (k === 'sort_order') {
      body[k] = parseInt(v as string, 10) || 0;
    } else {
      body[k] = v;
    }
  }

  try {
    await apiPatch(`/api/admin/games/${id}`, body);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { error: err.body?.message ?? `HTTP ${err.status}`, fieldErrors: pickFieldError(err) };
    }
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
    return { error: 'Gagal memperbarui game.' };
  }

  revalidatePath('/admin/games');
  revalidatePath(`/admin/games/${id}`);
  redirect(`/admin/games/${id}`);
}

export async function deleteGame(formData: FormData): Promise<void> {
  const id = formData.get('id')?.toString();
  if (!id) return;

  try {
    await apiDelete(`/api/admin/games/${id}`);
  } catch (err) {
    console.error('Delete game failed:', err);
  }

  revalidatePath('/admin/games');
}
