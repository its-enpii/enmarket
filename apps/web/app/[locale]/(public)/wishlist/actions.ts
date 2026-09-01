'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

import { wishlistApi } from '@/lib/wishlist-api';

export async function toggleWishlistAction(productId: number) {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(WISHLIST_SESSION_COOKIE)?.value;
  if (!sessionId || sessionId.length < 16) {
    sessionId = randomUUID();
    cookieStore.set(WISHLIST_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  try {
    const res = await wishlistApi.toggle(productId);
    revalidatePath('/wishlist');
    return { ok: true, added: res.added, count: res.count };
  } catch {
    return { ok: false, error: 'Gagal memperbarui wishlist.' };
  }
}

export async function removeWishlistAction(productId: number) {
  try {
    const res = await wishlistApi.remove(productId);
    revalidatePath('/wishlist');
    return { ok: true, count: res.count };
  } catch {
    return { ok: false, error: 'Gagal menghapus dari wishlist.' };
  }
}
import { CART_SESSION_COOKIE, WISHLIST_SESSION_COOKIE } from '@/lib/constants';
