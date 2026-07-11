'use server';

/**
 * Server actions untuk admin: logout.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ApiRequestError, apiPost } from '@/lib/api';

export async function logoutAction() {
  try {
    await apiPost('/api/admin/logout');
  } catch (err) {
    // 即使Laravel端失败，只要本地cookie被清掉就够了
    if (!(err instanceof ApiRequestError)) {
      // network error — still proceed to clear local cookie
    }
  }

  const cookieStore = await cookies();
  cookieStore.delete('admin_token');

  redirect('/login');
}
