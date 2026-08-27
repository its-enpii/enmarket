/**
 * Helper client-side API base URL.
 *
 * Di browser, jika NEXT_PUBLIC_API_URL bernilai internal docker hostname (misal http://api:8000),
 * kembalikan string kosong '' agar fetch dilakukan relatif terhadap host origin publik saat ini (/api/...).
 * Next.js rewrites di next.config.ts dan Nginx di production akan mem-proxy /api/* langsung ke Laravel api:8000.
 */
export function getClientApiBase(): string {
  if (typeof window !== 'undefined') {
    const pub = process.env.NEXT_PUBLIC_API_URL;
    if (!pub || pub.startsWith('http://api')) {
      return '';
    }
    return pub;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://api:8000';
}
