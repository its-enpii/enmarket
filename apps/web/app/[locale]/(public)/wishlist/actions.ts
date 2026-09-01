'use server';

import { revalidatePath } from 'next/cache';

import { wishlistApi } from '@/lib/wishlist-api';
import { WISHLIST_SESSION_COOKIE, COOKIE_MAX_AGE } from '@/lib/constants';
import { getOrCreateSession } from '@/lib/session-cookie';

export async function toggleWishlistAction(productId: number) {
  await getOrCreateSession(WISHLIST_SESSION_COOKIE, COOKIE_MAX_AGE.month30);

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
