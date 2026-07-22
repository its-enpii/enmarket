'use server';

/**
 * Server actions untuk halaman admin pre-orders.
 * - releasePreorderNow: trigger manual release order (claim license + notify)
 * - updatePreorderReleaseDate: postpone/prepone release date
 */

import { revalidatePath } from 'next/cache';

import { ApiRequestError, apiPost } from '@/lib/api';

export interface ActionResult {
  ok?: boolean;
  error?: string;
  message?: string;
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiRequestError) {
    return err.body?.message ?? `HTTP ${err.status}`;
  }
  return fallback;
}

/**
 * Trigger release pre-order — panggil endpoint admin yang invoke
 * PreorderReleaseService::releaseOrder. Idempotent di backend.
 */
export async function releasePreorderNow(kodeOrder: string): Promise<ActionResult> {
  try {
    const res = await apiPost<{ message: string }>(
      `/api/admin/preorders/${kodeOrder}/release-now`,
    );
    revalidatePath('/admin/preorders');
    revalidatePath(`/admin/orders/${kodeOrder}`);
    return { ok: true, message: res.message };
  } catch (err) {
    return { error: errorMessage(err, 'Gagal memproses release pre-order.') };
  }
}

/**
 * Update tanggal rilis pre-order. Hanya berlaku kalau order belum pernah di-release.
 */
export async function updatePreorderReleaseDate(
  kodeOrder: string,
  releaseDate: string,
): Promise<ActionResult> {
  try {
    const res = await apiPost<{ message: string }>(
      `/api/admin/preorders/${kodeOrder}/update-release-date`,
      { release_date: releaseDate },
    );
    revalidatePath('/admin/preorders');
    return { ok: true, message: res.message };
  } catch (err) {
    return { error: errorMessage(err, 'Gagal mengubah tanggal rilis.') };
  }
}