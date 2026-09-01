import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const MIN_SESSION_LENGTH = 16;
const MAX_SESSION_LENGTH = 64;

/**
 * Baca session cookie yang valid — READ-ONLY.
 * Aman dipanggil dari Server Component (tidak pernah men-set cookie).
 */
export async function getSession(cookieName: string): Promise<string | null> {
  const cookieStore = await cookies();
  const existingValue = cookieStore.get(cookieName)?.value;

  if (
    existingValue &&
    existingValue.length >= MIN_SESSION_LENGTH &&
    existingValue.length <= MAX_SESSION_LENGTH
  ) {
    return existingValue;
  }

  return null;
}

/**
 * Baca session cookie yang valid, atau buat dan set UUID baru.
 * Hanya boleh dipanggil dari Server Action / Route Handler (aturan Next 15).
 */
export async function getOrCreateSession(cookieName: string, maxAgeSeconds: number): Promise<string> {
  const existing = await getSession(cookieName);
  if (existing) {
    return existing;
  }

  const sessionId = randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(cookieName, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });

  return sessionId;
}
