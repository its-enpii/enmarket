/**
 * Server-side fetch helper untuk komunikasi Next.js Server Components
 * & Server Actions dengan Laravel API.
 *
 * - Auto-attach cookie admin_token via Authorization header
 * - Tidak cache: selalu fresh data
 * - Throw pada response non-2xx dengan pesan terstruktur
 */

import { cookies } from 'next/headers';
import type { ApiError } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiRequestError extends Error {
  status: number;
  body: ApiError;
  constructor(message: string, status: number, body: ApiError) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  formData?: FormData;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Override headers (mis. untuk Authorization di /admin/me tanpa cookie) */
  headers?: Record<string, string>;
  /** Skip reading cookie (untuk /login dll) */
  skipAuth?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  // Baca cookie kalau ada & skipAuth false
  if (!options.skipAuth) {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
    // Jangan set Content-Type — biar browser set boundary
  } else if (options.body !== undefined) {
    body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }

  // Build URL dengan query params
  let url = API_URL + (path.startsWith('/') ? path : `/${path}`);
  if (options.query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined && v !== null && v !== '') {
        params.append(k, String(v));
      }
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body,
    cache: 'no-store',
  });

  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { message: text || res.statusText };
  }

  if (!res.ok) {
    const err = (parsed as ApiError) || { message: `HTTP ${res.status}` };
    throw new ApiRequestError(err.message || `HTTP ${res.status}`, res.status, err);
  }

  return parsed as T;
}

/** Convenience wrappers */

export const apiGet = <T = unknown>(path: string, query?: RequestOptions['query']) =>
  apiFetch<T>(path, { method: 'GET', query });

export const apiPost = <T = unknown>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: 'POST', body });

export const apiPostForm = <T = unknown>(path: string, formData: FormData) =>
  apiFetch<T>(path, { method: 'POST', formData });

export const apiPut = <T = unknown>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: 'PUT', body });

export const apiPutForm = <T = unknown>(path: string, formData: FormData) =>
  apiFetch<T>(path, { method: 'PUT', formData });

export const apiDelete = <T = unknown>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: 'DELETE', body });