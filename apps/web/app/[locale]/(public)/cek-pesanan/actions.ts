'use server';

/**
 * Server action untuk halaman cek pesanan publik.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ApiRequestError, apiPost } from '@/lib/api';

interface CheckInput {
  kode_order: string;
  email: string;
}

interface CheckResult {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function checkOrderAction(input: CheckInput): Promise<CheckResult> {
  const t = await getTranslations('checkOrder');
  try {
    const res = await apiPost<{ data: { kode_order: string } }>('/api/orders/check', input);

    // Save ke cookie last_order_code untuk auto-fill next time
    const cookieStore = await cookies();
    cookieStore.set('last_order_code', res.data.kode_order, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    redirect(`/cek-pesanan/${encodeURIComponent(res.data.kode_order)}`);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      const body = err.body as { errors?: Record<string, string[]> } | undefined;
      const fieldErrors = body?.errors
        ? Object.fromEntries(
            Object.keys(body.errors).map((field) => [field, [t('errorGeneric')]]),
          )
        : undefined;
      return {
        error: err.status === 404 ? t('errorNotFound') : t('errorGeneric'),
        fieldErrors,
      };
    }
    // redirect() throws — biarin
    throw err;
  }
}

export async function getLastOrderCode(): Promise<string | null> {
  const c = await cookies();
  return c.get('last_order_code')?.value ?? null;
}