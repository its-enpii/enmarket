/**
 * Order/checkout API client.
 */

import { apiFetch, apiGet, apiPost } from './api';
import type { Order, OrderStatusSummary, SingleResponse } from './types';

export const orderApi = {
  /** Lightweight polling endpoint — status, paid_at, qr_expired_at, total */
  status: (kodeOrder: string) =>
    apiFetch<SingleResponse<OrderStatusSummary>>(`/api/orders/${kodeOrder}/status`),

  /** Full order detail by kode_order only — untuk halaman pembayaran / sukses */
  showPublic: (kodeOrder: string) =>
    apiGet<SingleResponse<Order>>(`/api/orders/${kodeOrder}/public`),

  /** Full order detail (butuh email verification via query) */
  show: (kodeOrder: string, email: string) =>
    apiGet<SingleResponse<Order>>(`/api/orders/${kodeOrder}`, { email }),

  /** Submit kode_order + email to verify + return summary */
  check: (kodeOrder: string, email: string) =>
    apiPost<SingleResponse<Order>>('/api/orders/check', { kode_order: kodeOrder, email }),
};