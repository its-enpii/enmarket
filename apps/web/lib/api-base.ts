/**
 * Single source for API base URLs.
 *
 * Client calls need a browser-reachable URL, while server calls can use the
 * Docker-internal hostname. Keep the fallback behavior of each consumer intact.
 */
export function getApiBase(): string {
  if (typeof window === 'undefined') {
    return (
      process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://api:8000'
    );
  }

  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  return publicApiUrl && !publicApiUrl.startsWith('http://api')
    ? publicApiUrl
    : 'http://localhost:8000';
}

export function getClientApiBase(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://api:8000';
  }

  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!publicApiUrl || publicApiUrl.startsWith('http://api')) {
    return '';
  }
  return publicApiUrl;
}
