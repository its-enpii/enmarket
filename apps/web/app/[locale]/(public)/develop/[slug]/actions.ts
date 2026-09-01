'use server';

/**
 * Server actions untuk halaman detail produk — add to cart.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { apiPost } from '@/lib/api';
import { getOrCreateCartSession } from '@/lib/cart-session';

interface AddResult {
  error?: string;
  ok?: boolean;
}

/**
 * Tambah produk ke cart, then stay on the same page.
 */
export async function addToCartAction(productId: number, qty = 1): Promise<AddResult> {
  const t = await getTranslations('developDetail');
  // Ensure cart session exists
  const sessionId = await getOrCreateCartSession();

  try {
    await apiPost('/api/cart/items', {
      product_id: productId,
      qty,
    });
    revalidatePath('/keranjang');
    return { ok: true };
  } catch {
    return { error: t('addError') };
  }
}

/**
 * Tambah ke cart lalu langsung redirect ke /keranjang.
 */
export async function addToCartAndGoAction(productId: number, qty = 1) {
  const t = await getTranslations('developDetail');
  await getOrCreateCartSession();

  try {
    await apiPost('/api/cart/items', {
      product_id: productId,
      qty,
    });
  } catch {
    throw new Error(t('addError'));
  }

  revalidatePath('/keranjang');
  redirect('/keranjang');
}
