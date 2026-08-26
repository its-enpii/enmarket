/**
 * Customer authentication token management & authenticated fetch helper.
 */

const TOKEN_COOKIE = 'customer_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const match = document.cookie.match(new RegExp('(^| )' + TOKEN_COOKIE + '=([^;]+)'));
  if (match) {
    return decodeURIComponent(match[2]);
  }
  return localStorage.getItem(TOKEN_COOKIE);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
  localStorage.setItem(TOKEN_COOKIE, token);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
  localStorage.removeItem(TOKEN_COOKIE);
}

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }
  return (
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://api:8000'
  );
};

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
