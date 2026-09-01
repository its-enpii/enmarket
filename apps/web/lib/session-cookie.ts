import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const MIN_SESSION_LENGTH = 16;
const MAX_SESSION_LENGTH = 64;

/**
 * Baca session cookie yang valid, atau buat dan set UUID baru.
 * Hanya boleh dipanggil dari Server Action / Route Handler.
 */
export async function getOrCreateSession(cookieName: string, maxAgeSeconds: number): Promise<string> {
  const cookieStore = await cookies();
  const existingValue = cookieStore.get(cookieName)?.value;

  if (
    existingValue &&
    existingValue.length >= MIN_SESSION_LENGTH &&
    existingValue.length <= MAX_SESSION_LENGTH
  ) {
    return existingValue;
  }

  const sessionId = randomUUID();
  cookieStore.set(cookieName, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });

  return sessionId;
}
