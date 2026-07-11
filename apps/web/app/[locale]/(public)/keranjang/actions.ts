'use server';

/**
 * Server actions untuk halaman keranjang — update qty / remove item.
 * Backend pakai cartApi yang auto-forward cart_session cookie.
 */

import { revalidatePath } from 'next/cache';

import { cartApi } from '@/lib/cart-api';

export async function updateCartItemAction(productId: number, qty: number) {
  await cartApi.update(productId, qty);
  revalidatePath('/keranjang');
}

export async function removeCartItemAction(productId: number) {
  await cartApi.remove(productId);
  revalidatePath('/keranjang');
}