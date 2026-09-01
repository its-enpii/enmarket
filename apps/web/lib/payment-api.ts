/**
 * Typed wrapper untuk payment gateway endpoints.
 */

import { apiGet, apiPost } from './api';
import { DEFAULT_GATEWAY } from './constants';
import type { PaymentGateway, PublicSiteConfig, SingleResponse } from './types';

export interface CheckoutPayload {
  nama: string;
  email: string;
  wa: string;
  coupon_code?: string;
  session_id?: string;
  payment_gateway?: PaymentGateway;
  payment_method?: string;
}

export interface CheckoutResponseData {
  kode_order: string;
  gateway?: PaymentGateway;
  redirect_url: string;
}

/**
 * Ambil list payment gateway yang aktif dari endpoint public site-config.
 */
export async function getEnabledGateways(): Promise<Array<{ key: PaymentGateway }>> {
  try {
    const res = await apiGet<SingleResponse<PublicSiteConfig>>('/api/public/site-config');
    const pgs = res.data.payment_gateways;
    if (!pgs) return [{ key: DEFAULT_GATEWAY }];

    const enabled: Array<{ key: PaymentGateway }> = [];
    if (pgs.tripay?.enabled) enabled.push({ key: DEFAULT_GATEWAY });
    if (pgs.duitku?.enabled) enabled.push({ key: 'duitku' });

    return enabled.length > 0 ? enabled : [{ key: DEFAULT_GATEWAY }];
  } catch {
    return [{ key: DEFAULT_GATEWAY }];
  }
}

/**
 * Buat checkout baru (POST /api/checkout).
 */
export async function createCheckout(payload: CheckoutPayload): Promise<SingleResponse<CheckoutResponseData>> {
  return apiPost<SingleResponse<CheckoutResponseData>>('/api/checkout', payload);
}
