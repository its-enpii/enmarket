'use server';

/**
 * Checkout server action — panggil Laravel POST /api/checkout.
 * Throw error kalau Tripay gagal — Frontend akan catch dan tampilkan.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { ApiRequestError, apiPost } from '@/lib/api';
import type { ApplyCouponResult, Cart, PaymentGateway, SingleResponse } from '@/lib/types';

interface CheckoutInput {
  nama: string;
  email: string;
  wa: string;
  coupon_code?: string;
  payment_gateway?: PaymentGateway;
  payment_method?: string;
}

interface CheckoutResult {
  kode_order?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function applyCouponAction(
  code: string,
  cartTotal: number,
): Promise<ApplyCouponResult> {
  try {
    const res = await apiPost<ApplyCouponResult>('/api/checkout/apply-coupon', {
      code,
      cart_total: cartTotal,
    });
    return res;
  } catch (err) {
    return {
      valid: false,
      discount_amount: 0,
      final_total: cartTotal,
      message: err instanceof Error ? err.message : 'Gagal menerapkan kupon.',
    };
  }
}

export async function checkoutAction(input: CheckoutInput): Promise<CheckoutResult> {
  const t = await getTranslations('checkout');
  const cookieStore = await cookies();
  const cartSession = cookieStore.get(CART_SESSION_COOKIE)?.value;

  try {
    const res = await apiPost<{ data: { kode_order: string; redirect_url: string } }>(
      '/api/checkout',
      { ...input, session_id: cartSession ?? undefined },
    );

    // Simpan kode_order ke cookie untuk auto-fill "cek pesanan"
    cookieStore.set('last_order_code', res.data.kode_order, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });

    revalidatePath('/keranjang');
    redirect(res.data.redirect_url);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      const body = err.body as { code?: string; message?: string; errors?: Record<string, string[]> } | undefined;
      // Map field errors: kalau field termasuk wa, pakai errorPhone; kalau email,
      // pakai errorEmail; selain itu tampilkan pesan asli dari Laravel biar tidak misleading.
      // Tapi exception: kalau pesan asli generic English ("The nama field is required."), pakai errorRequired ID/EN.
      const fieldErrors = body?.errors
        ? Object.fromEntries(
            Object.entries(body.errors).map(([field, msgs]) => [
              field,
              [pickFieldError(field, msgs[0] ?? '', t)],
            ]),
          )
        : undefined;
      return {
        // Untuk non-field error dari Laravel (mis. cart_empty), tampilkan pesan aslinya
        // kalau ada — jangan fallback ke generic.
        error: body?.message && !body.errors ? body.message : t('errorGeneric'),
        fieldErrors,
      };
    }
    // redirect() throws special error — biarin lewat biar Next.js handle
    throw err;
  }
}

// Used to populate last order field di halaman cek pesanan
export async function getLastOrderCode(): Promise<string | null> {
  const c = await cookies();
  return c.get('last_order_code')?.value ?? null;
}

// helper buat last cart preview fetch
export async function fetchCartPreview(): Promise<Cart | null> {
  try {
    const res = await apiPost<SingleResponse<Cart>>('/api/checkout', {});
    return res.data;
  } catch {
    return null;
  }
}

/**
 * Pilih pesan field error: kalau field wa/email, pakai terjemahan tematik;
 * otherwise tampilkan pesan asli Laravel supaya user tahu masalahnya apa.
 */
function pickFieldError(
  field: string,
  laravelMsg: string,
  t: Awaited<ReturnType<typeof getTranslations<'checkout'>>>,
): string {
  if (field === 'wa') return t('errorPhone');
  if (field === 'email') return t('errorEmail');
  if (field === 'nama') return t('errorRequired');
  return laravelMsg || t('errorRequired');
}
import { CART_SESSION_COOKIE } from '@/lib/constants';
