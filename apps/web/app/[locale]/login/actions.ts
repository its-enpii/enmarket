'use server';

/**
 * Login server action — dipanggil dari LoginForm.
 * Set cookie dan redirect ke /[locale]/admin.
 */

import { cookies } from 'next/headers';
import { redirect } from '@/i18n/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { ApiRequestError, apiPost } from '@/lib/api';

interface LoginResponse {
  message: string;
  authenticated: boolean;
}

interface LoginResult {
  error?: string;
}

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const t = await getTranslations('login');
  const token = formData.get('token')?.toString() ?? '';

  if (!token.trim()) {
    return { error: t('errorRequired') };
  }

  try {
    await apiPost<LoginResponse>('/api/admin/login', { token });
  } catch (err) {
    if (err instanceof ApiRequestError && (err.status === 401 || err.status === 422)) {
      return { error: t('errorInvalid') };
    }
    return { error: t('errorGeneric') };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  const locale = await getLocale();
  redirect({ href: '/admin', locale });
  return {} as LoginResult;
}