import { cookies } from 'next/headers';

import { COOKIE_MAX_AGE, LAST_ORDER_CODE_COOKIE } from './constants';

const cookieOptions = {
  httpOnly: false,
  sameSite: 'lax',
  path: '/',
  maxAge: COOKIE_MAX_AGE.month30,
} as const;

export async function setLastOrderCode(code: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LAST_ORDER_CODE_COOKIE, code, cookieOptions);
}

export async function getLastOrderCode(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(LAST_ORDER_CODE_COOKIE)?.value ?? null;
}
