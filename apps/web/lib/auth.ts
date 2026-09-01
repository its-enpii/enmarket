/**
 * Customer authentication token management & authenticated fetch helper.
 */

import { CUSTOMER_TOKEN_COOKIE } from './constants';
import { COOKIE_MAX_AGE } from './constants';
import { deleteClientCookie, getClientCookie, setClientCookie } from './client-cookie';
import { getApiBase } from './api-base';

const TOKEN_COOKIE = CUSTOMER_TOKEN_COOKIE;

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return getClientCookie(TOKEN_COOKIE) ?? localStorage.getItem(TOKEN_COOKIE);
  return localStorage.getItem(TOKEN_COOKIE);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  setClientCookie(TOKEN_COOKIE, token, COOKIE_MAX_AGE.month30);
  localStorage.setItem(TOKEN_COOKIE, token);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  deleteClientCookie(TOKEN_COOKIE);
  localStorage.removeItem(TOKEN_COOKIE);
}

const getApiUrl = () => getApiBase();

export async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {},
  tokenOverride?: string
): Promise<T> {
  const token = tokenOverride ?? getAuthToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${getApiUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || res.statusText };
  }

  if (!res.ok) {
    const error = new Error(data.message || `HTTP ${res.status}`);
    (error as any).status = res.status;
    (error as any).data = data;
    throw error;
  }

  return data as T;
}
