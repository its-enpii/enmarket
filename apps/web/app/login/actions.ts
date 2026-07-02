'use server';

/**
 * Login server action — dipanggil dari LoginForm.
 * Set cookie dan redirect ke /admin.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ApiRequestError, apiPost } from '@/lib/api';

interface LoginResponse {
  message: string;
  authenticated: boolean;
}

interface LoginResult {
  error?: string;
}

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const token = formData.get('token')?.toString() ?? '';

  if (!token.trim()) {
    return { error: 'Token wajib diisi.' };
  }

  try {
    await apiPost<LoginResponse>('/api/admin/login', { token });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      const msg = err.body?.message || `HTTP ${err.status}`;
      const fieldErrors = err.body?.errors?.token;
      return { error: fieldErrors?.[0] ?? msg };
    }
    return { error: 'Login gagal — coba lagi.' };
  }

  // Set local cookie agar middleware layout berikutnya tidak redirect
  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  redirect('/admin');
}