import { fetchWithAuth } from './auth';
import { getApiBase } from './api-base';

export interface SponsorBidConfig {
  min_bid: number;
  gateways: string[];
}

export interface SponsorBidPreview {
  name: string;
  logo_url: string | null;
  fetched_description: string | null;
}

export interface SponsorBidCheckoutResult {
  kode_order: string;
  gateway: string;
  payment_url?: string;
  qr_url?: string | null;
  qr_string?: string | null;
  redirect_url: string;
}

const API_URL = getApiBase();

async function fetchConfig(): Promise<SponsorBidConfig> {
  const res = await fetch(`${API_URL}/api/public/sponsors/bid/config`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Fetch sponsor config failed: HTTP ${res.status}`);
  }
  const json = (await res.json()) as { data: SponsorBidConfig };
  return json.data;
}

async function preview(domain: string): Promise<SponsorBidPreview> {
  const res = await fetchWithAuth<{ data: SponsorBidPreview }>(
    '/api/public/sponsors/bid/preview',
    { method: 'POST', body: JSON.stringify({ domain }) },
  );
  return res.data;
}

export const sponsorBidApi = {
  fetchConfig,
  preview,
  checkout: (payload: {
    domain: string;
    name?: string;
    description?: string;
    contact_name: string;
    email?: string;
    wa?: string;
    amount: number;
    payment_gateway: string;
    payment_method?: string;
  }) =>
    fetchWithAuth<{ data: SponsorBidCheckoutResult }>('/api/public/sponsors/bid', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
