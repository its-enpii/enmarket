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
    // Even kalau Laravel-side gagal, local cookie harus tetap di-clear
    // supaya user tidak stuck di state "seolah-olah masih login".
    if (!(err instanceof ApiRequestError)) {
      // network error — still proceed to clear local cookie
    }
  }

  const cookieStore = await cookies();
  cookieStore.delete('admin_token');

  redirect('/login');
}
