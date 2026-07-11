'use server';

/**
 * Server actions untuk halaman detail produk — add to cart.
 */

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';

import { ApiRequestError, apiPost } from '@/lib/api';

interface AddResult {
  error?: string;
  ok?: boolean;
}

/**
 * Tambah produk ke cart, then stay on the same page.
 */
export async function addToCartAction(productId: number, qty = 1): Promise<AddResult> {
  // Ensure cart session exists
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('cart_session')?.value;
  if (!sessionId || sessionId.length < 16) {
    sessionId = randomUUID();
    cookieStore.set('cart_session', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
  }

  try {
    await apiPost('/api/cart/items', {
      product_id: productId,
      qty,
    });
    revalidatePath('/keranjang');
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { error: err.body?.message ?? err.message };
    }
    return { error: 'Gagal menambahkan ke keranjang.' };
  }
}

/**
 * Tambah ke cart lalu langsung redirect ke /keranjang.
 */
export async function addToCartAndGoAction(productId: number, qty = 1) {
  const cookieStore = await cookies();
  const existingSession = cookieStore.get('cart_session')?.value;
  if (!existingSession || existingSession.length < 16) {
    cookieStore.set('cart_session', randomUUID(), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
  }

  try {
    await apiPost('/api/cart/items', {
      product_id: productId,
      qty,
    });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      throw new Error(err.body?.message ?? err.message);
    }
    throw err;
  }

  revalidatePath('/keranjang');
  redirect('/keranjang');
}