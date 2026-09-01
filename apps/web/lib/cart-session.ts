/**
 * Server-side cart session helper.
 *
 * Resolve cookie `cart_session` (UUID) untuk CartService lookup.
 *
 * Cookie hanya bisa di-set di Server Action / Route Handler (aturan Next 15).
 * Di Server Component pakai readCartSession() untuk baca saja;
 * untuk create cookie baru, panggil dari Server Action.
 */

import { CART_SESSION_COOKIE, COOKIE_MAX_AGE } from './constants';
import { getOrCreateSession } from './session-cookie';

export async function readCartSession(): Promise<string | null> {
  const session = await getOrCreateSession(CART_SESSION_COOKIE, COOKIE_MAX_AGE.day);
  return session;
}

/**
 * Set cart session cookie. Hanya boleh dipanggil dari Server Action.
 * Returns the new UUID.
 */
export async function setCartSession(): Promise<string> {
  return getOrCreateSession(CART_SESSION_COOKIE, COOKIE_MAX_AGE.day);
}

/**
 * Read existing session, or null. Use from Server Components.
 * Use setCartSession() from Server Actions to create.
 */
export async function getOrCreateCartSession(): Promise<string | null> {
  return setCartSession();
}
