/**
 * Cart API client — wrap Laravel /api/cart endpoints.
 *
 * Server-side fetch helper: dipakai dari Server Components / Server Actions.
 * Auto-forward session via cookie (Next.js otomatis forward same-origin cookie
 * saat fetch di server context).
 */

import { apiDelete, apiFetch, apiPatch, apiPost } from './api';
import { PublicFetchError } from './public-api';
import type { Cart, SingleResponse } from './types';

export { PublicFetchError };

export const cartApi = {
  get: () => apiFetch<SingleResponse<Cart>>('/api/cart', { method: 'GET' }),

  add: (productId: number, qty = 1) =>
    apiPost<SingleResponse<Cart>>('/api/cart/items', { product_id: productId, qty }),

  update: (productId: number, qty: number) =>
    apiPatch<SingleResponse<Cart>>(`/api/cart/items/${productId}`, { qty }),

  remove: (productId: number) =>
    apiDelete<SingleResponse<Cart>>(`/api/cart/items/${productId}`),
};