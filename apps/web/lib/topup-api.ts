/**
 * Top-up game API client wrappers.
 */

import { fetchWithAuth } from './auth';
import type {
  Game,
  PaginatedResponse,
  SingleResponse,
  TopupOrder,
  TopupPreview,
} from './types';

const API_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  : (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api:8000');

async function publicFetch<T>(path: string): Promise<T> {
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Fetch ${path} failed: HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const topupApi = {
  listGames: () =>
    publicFetch<{ data: Game[] }>('/api/public/topup/games'),

  getGame: (slug: string) =>
    publicFetch<{ data: Game }>(`/api/public/topup/games/${slug}`),

  previewTopup: (payload: {
    game_id: number;
    game_item_id: number;
    user_id: string;
    server_id?: string;
    contact_type: 'phone' | 'email';
    contact_value: string;
  }) =>
    fetchWithAuth<{ data: TopupPreview }>('/api/public/topup/preview', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  checkoutTopup: (payload: {
    game_id: number;
    game_item_id: number;
    user_id: string;
    server_id?: string;
    contact_type: 'phone' | 'email';
    contact_value: string;
    payment_gateway: string;
  }) =>
    fetchWithAuth<{ data: { kode_order: string; redirect_url: string }; message: string }>('/api/public/topup/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getTopupHistory: (page = 1) =>
    fetchWithAuth<PaginatedResponse<TopupOrder>>(`/api/customer/topups?page=${page}`, {
      method: 'GET',
    }),
};
