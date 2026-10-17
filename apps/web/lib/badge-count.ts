import { getClientApiBase } from '@/lib/client-api';
import { getClientCookie } from '@/lib/client-cookie';
import { CART_SESSION_COOKIE, CUSTOMER_TOKEN_COOKIE, WISHLIST_SESSION_COOKIE } from '@/lib/constants';
import type { Cart, SingleResponse, WishlistResponse } from '@/lib/types';

type Endpoint = 'cart' | 'wishlist';

const inFlight = new Map<Endpoint, Promise<number>>();

const IDENTITY_COOKIES: Record<Endpoint, readonly string[]> = {
  cart: [CART_SESSION_COOKIE, CUSTOMER_TOKEN_COOKIE],
  wishlist: [WISHLIST_SESSION_COOKIE, CUSTOMER_TOKEN_COOKIE],
};

/**
 * Skip fetch awal saat tidak ada cookie identitas: tanpa identitas server selalu
 * membalas count 0 (tanpa Set-Cookie), jadi menghindari request tidak mengubah hasil.
 * Event `enstudio:cart-changed` tetap selalu memanggil fetch.
 */
export function hasBadgeIdentity(endpoint: Endpoint): boolean {
  return IDENTITY_COOKIES[endpoint].some((name) => !!getClientCookie(name));
}

function requestCount(endpoint: Endpoint): Promise<number> {
  const pending = inFlight.get(endpoint);
  if (pending) return pending;

  const promise = fetch(`${getClientApiBase()}/api/${endpoint}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((res) => {
      if (!res) return 0;
      if (endpoint === 'cart') {
        return (res as SingleResponse<Cart>).data.item_count ?? 0;
      }
      const wishlist = res as WishlistResponse;
      return wishlist.count ?? wishlist.data?.length ?? 0;
    })
    .finally(() => {
      inFlight.delete(endpoint);
    });

  inFlight.set(endpoint, promise);
  return promise;
}

export function fetchCartCount(): Promise<number> {
  return requestCount('cart');
}

export function fetchWishlistCount(): Promise<number> {
  return requestCount('wishlist');
}
