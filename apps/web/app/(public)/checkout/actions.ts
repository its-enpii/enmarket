'use server';

/**
 * Checkout server action — panggil Laravel POST /api/checkout.
 * Throw error kalau Tripay gagal — Frontend akan catch dan tampilkan.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { ApiRequestError, apiPost } from '@/lib/api';
import type { Cart, SingleResponse } from '@/lib/types';

interface CheckoutInput {
  nama: string;
  email: string;
  wa: string;
}

interface CheckoutResult {
  kode_order?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function checkoutAction(input: CheckoutInput): Promise<CheckoutResult> {
  const cookieStore = await cookies();
  const cartSession = cookieStore.get('cart_session')?.value;

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
      return {
        error: body?.message ?? err.message,
        fieldErrors: body?.errors,
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