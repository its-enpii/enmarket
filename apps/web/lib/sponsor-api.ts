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

export interface SponsorLeaderboardEntry {
  rank: number;
  name: string;
  domain: string;
  bid_amount: number;
  paid_at: string;
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

async function fetchLeaderboard(): Promise<SponsorLeaderboardEntry[]> {
  const res = await fetch(`${API_URL}/api/public/sponsors/leaderboard`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Fetch sponsor leaderboard failed: HTTP ${res.status}`);
  }
  const json = (await res.json()) as { data: SponsorLeaderboardEntry[] };
  return json.data;
}

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
  fetchLeaderboard,
  preview,
  checkout: (payload: {
    domain: string;
    name?: string;
    description?: string;
    contact_name?: string;
    email?: string;
    wa?: string;
    amount: number;
    payment_gateway: string;
    payment_method?: string;
  }) => {
    if (!payload.payment_gateway) {
      return fetchConfig().then((config) =>
        fetchWithAuth<{ data: SponsorBidCheckoutResult }>('/api/public/sponsors/bid', {
          method: 'POST',
          body: JSON.stringify({ ...payload, payment_gateway: config.gateways[0] }),
        }),
      );
    }

    return fetchWithAuth<{ data: SponsorBidCheckoutResult }>('/api/public/sponsors/bid', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
