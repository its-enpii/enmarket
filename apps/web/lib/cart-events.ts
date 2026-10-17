/**
 * Event bus ringan untuk sinkronisasi badge cart/wishlist.
 *
 * Modul ini sengaja tanpa dependensi React dan tanpa `'use client'`: boleh
 * diimpor dari mana saja, dan aman dipanggil saat SSR (guard runtime).
 * Komponen badge mendengarkan CART_EVENT, lalu re-fetch count dari klien.
 */

export const CART_EVENT = 'enstudio:cart-changed';

export type CartChangedKind = 'cart' | 'wishlist';

export function notifyCartChanged(kind: CartChangedKind): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<{ kind: CartChangedKind }>(CART_EVENT, { detail: { kind } }));
}

