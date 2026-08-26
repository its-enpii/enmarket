'use server';

/**
 * Server actions untuk CRUD kupon admin.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { ApiRequestError, apiDelete, apiPatch, apiPost } from '@/lib/api';

export interface ActionResult {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ───── Create ─────
export async function createCoupon(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const code = formData.get('code')?.toString() ?? '';
  const type = formData.get('type')?.toString() ?? 'percent';
  const value = parseFloat(formData.get('value')?.toString() ?? '0');
  const min_order_val = formData.get('min_order')?.toString();
  const min_order = min_order_val ? parseFloat(min_order_val) : null;
  const max_uses_val = formData.get('max_uses')?.toString();
  const max_uses = max_uses_val ? parseInt(max_uses_val, 10) : null;
  const valid_from = formData.get('valid_from')?.toString() || null;
  const valid_until = formData.get('valid_until')?.toString() || null;
  const active = formData.get('active') === 'on' || formData.get('active') === 'true';

  try {
    await apiPost('/api/admin/coupons', {
      code,
      type,
      value,
      min_order,
      max_uses,
      valid_from,
      valid_until,
      active,
    });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: err.body?.message ?? `HTTP ${err.status}`,
        fieldErrors: err.body?.errors,
      };
    }
    return { error: 'Gagal membuat kupon.' };
  }

  revalidatePath('/admin/coupons');
  redirect('/admin/coupons');
}

// ───── Update ─────
export async function updateCoupon(
  id: number,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const code = formData.get('code')?.toString() ?? '';
  const type = formData.get('type')?.toString() ?? 'percent';
  const value = parseFloat(formData.get('value')?.toString() ?? '0');
  const min_order_val = formData.get('min_order')?.toString();
  const min_order = min_order_val ? parseFloat(min_order_val) : null;
  const max_uses_val = formData.get('max_uses')?.toString();
  const max_uses = max_uses_val ? parseInt(max_uses_val, 10) : null;
  const valid_from = formData.get('valid_from')?.toString() || null;
  const valid_until = formData.get('valid_until')?.toString() || null;
  const active = formData.get('active') === 'on' || formData.get('active') === 'true';

  try {
    await apiPatch(`/api/admin/coupons/${id}`, {
      code,
      type,
      value,
      min_order,
      max_uses,
      valid_from,
      valid_until,
      active,
    });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: err.body?.message ?? `HTTP ${err.status}`,
        fieldErrors: err.body?.errors,
      };
    }
    return { error: 'Gagal memperbarui kupon.' };
  }

  revalidatePath('/admin/coupons');
  redirect('/admin/coupons');
}

// ───── Delete (Soft delete) ─────
export async function deleteCoupon(formData: FormData): Promise<void> {
  const id = formData.get('id')?.toString();
  if (!id) return;

  try {
    await apiDelete(`/api/admin/coupons/${id}`);
  } catch (err) {
    console.error('Delete coupon failed:', err);
  }

  revalidatePath('/admin/coupons');
}
