/**
 * Typed wrapper untuk payment gateway endpoints.
 */

import { apiGet, apiPost } from './api';
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
    if (!pgs) return [{ key: 'tripay' }];

    const enabled: Array<{ key: PaymentGateway }> = [];
    if (pgs.tripay?.enabled) enabled.push({ key: 'tripay' });
    if (pgs.duitku?.enabled) enabled.push({ key: 'duitku' });

    return enabled.length > 0 ? enabled : [{ key: 'tripay' }];
  } catch {
    return [{ key: 'tripay' }];
  }
}

/**
 * Buat checkout baru (POST /api/checkout).
 */
export async function createCheckout(payload: CheckoutPayload): Promise<SingleResponse<CheckoutResponseData>> {
  return apiPost<SingleResponse<CheckoutResponseData>>('/api/checkout', payload);
}
