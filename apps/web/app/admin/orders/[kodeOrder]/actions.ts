'use server';

/**
 * Server actions untuk halaman detail order.
 * - resendOrder: re-trigger notif email/wa/all
 * - regenerateDownloadToken: issue token baru untuk 1 order_item
 * - generateOrderDeliveries: re-trigger service generateForOrder
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

// ───── Resend notification ─────

export async function resendOrder(
  kodeOrder: string,
  channel: 'email' | 'wa' | 'all',
): Promise<ActionResult> {
  try {
    const res = await apiPost<{ message: string }>(
      `/api/admin/orders/${kodeOrder}/resend`,
      { channel },
    );
    revalidatePath(`/admin/orders/${kodeOrder}`);
    return { ok: true, message: res.message };
  } catch (err) {
    return { error: errorMessage(err, 'Gagal mengirim ulang notifikasi.') };
  }
}

// ───── Regenerate token ─────

export async function regenerateDownloadToken(
  kodeOrder: string,
  orderItemId: number,
): Promise<ActionResult> {
  try {
    const res = await apiPost<{ message: string }>(
      `/api/admin/orders/${kodeOrder}/regenerate-token`,
      { order_item_id: orderItemId },
    );
    revalidatePath(`/admin/orders/${kodeOrder}`);
    return { ok: true, message: res.message };
  } catch (err) {
    return { error: errorMessage(err, 'Gagal regenerate token.') };
  }
}

// ───── Generate deliveries (re-trigger) ─────

export async function generateOrderDeliveries(kodeOrder: string): Promise<ActionResult> {
  try {
    const res = await apiPost<{ message: string }>(
      `/api/admin/orders/${kodeOrder}/generate-deliveries`,
    );
    revalidatePath(`/admin/orders/${kodeOrder}`);
    return { ok: true, message: res.message };
  } catch (err) {
    return { error: errorMessage(err, 'Gagal generate deliveries.') };
  }
}