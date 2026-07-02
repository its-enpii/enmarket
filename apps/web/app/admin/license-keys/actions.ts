'use server';

/**
 * Server actions untuk license key management.
 * - insertLicenseKey: batch insert manual
 * - revokeLicenseKey: set status=dicabut
 * - extendLicenseKey: extend expired_at
 */

import { revalidatePath } from 'next/cache';

import { ApiRequestError, apiPost } from '@/lib/api';

export interface ActionResult {
  ok?: boolean;
  error?: string;
  message?: string;
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

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiRequestError) {
    return err.body?.message ?? `HTTP ${err.status}`;
  }
  return fallback;
}

// ───── Insert manual ─────

export async function insertLicenseKey(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const res = await apiPost<{ message: string; count: number }>(
      '/api/admin/license-keys',
      {
        product_id: Number(formData.get('product_id')),
        count: Number(formData.get('count')),
        prefix: String(formData.get('prefix') ?? '').trim() || undefined,
      },
    );
    revalidatePath('/admin/license-keys');
    return { ok: true, message: res.message };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: errorMessage(err, 'Gagal insert license key.'),
        fieldErrors: pickFieldError(err),
      };
    }
    return { error: 'Gagal insert license key.' };
  }
}

// ───── Revoke ─────

export async function revokeLicenseKey(formData: FormData): Promise<ActionResult> {
  const id = Number(formData.get('id'));
  if (!id) return { error: 'ID key tidak valid.' };

  try {
    const res = await apiPost<{ message: string }>(`/api/admin/license-keys/${id}/revoke`);
    revalidatePath('/admin/license-keys');
    return { ok: true, message: res.message };
  } catch (err) {
    return { error: errorMessage(err, 'Gagal mencabut key.') };
  }
}

// ───── Extend ─────

export async function extendLicenseKey(formData: FormData): Promise<ActionResult> {
  const id = Number(formData.get('id'));
  const days = Number(formData.get('days'));
  if (!id) return { error: 'ID key tidak valid.' };
  if (!Number.isFinite(days) || days < 1) return { error: 'Jumlah hari tidak valid.' };

  try {
    const res = await apiPost<{ message: string }>(`/api/admin/license-keys/${id}/extend`, { days });
    revalidatePath('/admin/license-keys');
    return { ok: true, message: res.message };
  } catch (err) {
    return { error: errorMessage(err, 'Gagal memperpanjang key.') };
  }
}