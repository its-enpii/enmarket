'use server';

/**
 * Server actions untuk admin account provisioning queue.
 * - markReadyProvisioning: submit kredensial pertama kali
 * - regenerateProvisioning: ganti kredensial existing
 * - resendProvisioning: re-trigger notifikasi buyer
 */

import { revalidatePath } from 'next/cache';

import { ApiRequestError, apiPost } from '@/lib/api';

export interface ActionResult {
  ok?: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiRequestError) {
    return err.body?.message ?? `HTTP ${err.status}`;
  }
  return fallback;
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

export async function markReadyProvisioning(
  id: number,
  body: { credentials: Record<string, string | undefined>; catatan?: string },
): Promise<ActionResult> {
  try {
    const res = await apiPost<{ message: string }>(
      `/api/admin/account-provisionings/${id}/mark-ready`,
      body,
    );
    revalidatePath('/admin/account-provisionings');
    revalidatePath('/');
    return { ok: true, message: res.message };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: errorMessage(err, 'Gagal menandai siap.'),
        fieldErrors: pickFieldError(err),
      };
    }
    return { error: 'Gagal menandai siap.' };
  }
}

export async function regenerateProvisioning(
  id: number,
  body: { credentials: Record<string, string | undefined>; catatan?: string },
): Promise<ActionResult> {
  try {
    const res = await apiPost<{ message: string }>(
      `/api/admin/account-provisionings/${id}/regenerate`,
      body,
    );
    revalidatePath('/admin/account-provisionings');
    return { ok: true, message: res.message };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: errorMessage(err, 'Gagal memperbarui kredensial.'),
        fieldErrors: pickFieldError(err),
      };
    }
    return { error: 'Gagal memperbarui kredensial.' };
  }
}

export async function resendProvisioning(id: number): Promise<ActionResult> {
  try {
    const res = await apiPost<{ message: string }>(
      `/api/admin/account-provisionings/${id}/resend`,
    );
    revalidatePath('/admin/account-provisionings');
    return { ok: true, message: res.message };
  } catch (err) {
    return { error: errorMessage(err, 'Gagal kirim ulang notifikasi.') };
  }
}
