/**
 * Customer authentication API client.
 */

import { fetchWithAuth, setAuthToken, clearAuthToken } from './auth';
import type { CustomerUser, Order, PaginatedResponse, WishlistResponse } from './types';

export interface RequestOtpResponse {
  success: boolean;
  cooldown_seconds: number;
  message: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token: string;
  user: CustomerUser;
}

export const authApi = {
  /** Request WhatsApp OTP */
  requestOtp: async (phone: string, locale?: string): Promise<RequestOtpResponse> => {
    return fetchWithAuth<RequestOtpResponse>('/api/customer/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, locale }),
    });
  },

  /** Verify WhatsApp OTP and obtain token */
  verifyOtp: async (
    phone: string,
    code: string,
    sessionId?: string,
    wishlistSession?: string,
    name?: string
  ): Promise<VerifyOtpResponse> => {
    const res = await fetchWithAuth<VerifyOtpResponse>('/api/customer/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        phone,
        code,
        session_id: sessionId,
        wishlist_session: wishlistSession,
        name,
      }),
    });

    if (res.token) {
      setAuthToken(res.token);
    }

    return res;
  },

  /** Logout customer and clear token */
  logout: async (): Promise<void> => {
    try {
      await fetchWithAuth('/api/customer/auth/logout', { method: 'POST' });
    } finally {
      clearAuthToken();
    }
  },

  /** Get currently authenticated customer */
  me: async (): Promise<{ user: CustomerUser }> => {
    return fetchWithAuth<{ user: CustomerUser }>('/api/customer/auth/me', {
      method: 'GET',
    });
  },

  /** Update customer profile */
  updateProfile: async (data: {
    name?: string;
    phone?: string;
    email?: string;
  }): Promise<{ success: boolean; message: string; user: CustomerUser }> => {
    return fetchWithAuth<{ success: boolean; message: string; user: CustomerUser }>(
      '/api/customer/auth/profile',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /** Get customer orders list */
  getOrders: async (page = 1): Promise<PaginatedResponse<Order>> => {
    return fetchWithAuth<PaginatedResponse<Order>>(`/api/customer/orders?page=${page}`, {
      method: 'GET',
    });
  },

  /** Get customer wishlist */
  getWishlist: async (): Promise<WishlistResponse> => {
    return fetchWithAuth<WishlistResponse>('/api/customer/wishlist', {
      method: 'GET',
    });
  },

  /** Toggle product in customer wishlist */
  toggleWishlist: async (
    productId: number
  ): Promise<{ added: boolean; count: number; message: string }> => {
    return fetchWithAuth<{ added: boolean; count: number; message: string }>(
      '/api/customer/wishlist/toggle',
      {
        method: 'POST',
        body: JSON.stringify({ product_id: productId }),
      }
    );
  },

  /** Remove product from customer wishlist */
  removeFromWishlist: async (
    productId: number
  ): Promise<{ count: number; message: string }> => {
    return fetchWithAuth<{ count: number; message: string }>(
      `/api/customer/wishlist/${productId}`,
      {
        method: 'DELETE',
      }
    );
  },
};
