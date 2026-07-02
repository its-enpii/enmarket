/**
 * Server-side cart session helper.
 *
 * Resolve cookie `cart_session` (UUID) untuk CartService lookup.
 *
 * Cookie hanya bisa di-set di Server Action / Route Handler (aturan Next 15).
 * Di Server Component pakai readCartSession() untuk baca saja;
 * untuk create cookie baru, panggil dari Server Action.
 */

import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const COOKIE_NAME = 'cart_session';
const MAX_AGE_SECONDS = 60 * 60 * 24; // 24 jam

export async function readCartSession(): Promise<string | null> {
  const c = await cookies();
  const value = c.get(COOKIE_NAME)?.value;
  if (value && value.length >= 16 && value.length <= 64) {
    return value;
  }
  return null;
}

/**
 * Set cart session cookie. Hanya boleh dipanggil dari Server Action.
 * Returns the new UUID.
 */
export async function setCartSession(): Promise<string> {
  const c = await cookies();
  const id = randomUUID();
  c.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
  return id;
}

/**
 * Read existing session, or null. Use from Server Components.
 * Use setCartSession() from Server Actions to create.
 */
export async function getOrCreateCartSession(): Promise<string | null> {
  return readCartSession();
}