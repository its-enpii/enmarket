/**
 * Wishlist API client — wrap Laravel /api/wishlist endpoints.
 */

import { apiDelete, apiFetch, apiPost } from './api';
import { PublicFetchError } from './public-api';
import type { WishlistResponse } from './types';

export { PublicFetchError };

export const wishlistApi = {
  get: () => apiFetch<WishlistResponse>('/api/wishlist', { method: 'GET' }),

  toggle: (productId: number) =>
    apiPost<{ added: boolean; count: number; message?: string }>('/api/wishlist/toggle', {
      product_id: productId,
    }),

  remove: (productId: number) =>
    apiDelete<{ message: string; count: number }>(`/api/wishlist/${productId}`),
};
