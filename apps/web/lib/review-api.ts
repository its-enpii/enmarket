/**
 * Review API client — wrap Laravel reviews endpoints (Public, Customer, Admin).
 */

import { apiDelete, apiFetch, apiGet, apiPatch, apiPost } from './api';
import type { PaginatedResponse, ProductRatingSummary, Review, ReviewStats, SingleResponse } from './types';

export interface ProductReviewsResponse {
  data: Review[];
  summary: ProductRatingSummary;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SubmitReviewPayload {
  kode_order: string;
  product_id: number;
  rating: number;
  comment?: string;
  email_or_phone?: string;
  buyer_name?: string;
}

export const reviewApi = {
  getProductReviews: (slug: string, page = 1, rating?: number) => {
    const params: Record<string, string | number> = { page };
    if (rating) params.rating = rating;
    return apiGet<ProductReviewsResponse>(`/api/public/products/${slug}/reviews`, params);
  },

  getOrderReviews: (kodeOrder: string) =>
    apiGet<{ data: Review[]; reviewed_product_ids: number[] }>(`/api/orders/${kodeOrder}/reviews`),

  submitReview: (payload: SubmitReviewPayload) =>
    apiPost<SingleResponse<Review>>('/api/reviews', payload),

  // Admin
  getAdminReviews: (query: { page?: number | string; q?: string; is_published?: string; rating?: string; product_id?: string | number }) =>
    apiGet<PaginatedResponse<Review>>('/api/admin/reviews', query as Record<string, string | number>),

  getAdminStats: () =>
    apiGet<SingleResponse<ReviewStats>>('/api/admin/reviews/stats'),

  updateAdminReview: (id: number, data: { is_published?: boolean; admin_notes?: string }) =>
    apiPatch<SingleResponse<Review>>(`/api/admin/reviews/${id}`, data),

  deleteAdminReview: (id: number) =>
    apiDelete<{ message: string }>(`/api/admin/reviews/${id}`),
};
