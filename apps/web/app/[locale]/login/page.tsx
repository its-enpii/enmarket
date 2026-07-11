/**
 * Halaman login admin — translated.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { apiFetch } from '@/lib/api';
import { LoginForm } from './LoginForm';
import { Link } from '@/i18n/navigation';

import { loginAction } from './actions';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'login' });
  return { title: `${t('title')} — enpiistudio` };
}

export default async function LoginPage() {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get('admin_token')?.value;

  if (existingToken) {
    try {
      await apiFetch<{ authenticated: boolean }>('/api/admin/me', {
        skipAuth: true,
        headers: { Authorization: `Bearer ${existingToken}` },
      });
      redirect('/admin');
    } catch {
      // Token invalid/expired.
    }
  }

  const t = await getTranslations('login');

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-surface border-4 border-ink p-8 shadow-[8px_8px_0_0_var(--color-ink)]">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            enpiistudio Admin
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm text-ink/70">
            {t('subtitle')}
          </p>

          <LoginForm action={loginAction} />
        </div>

        <p className="mt-6 text-center text-sm">
          <Link
            href="/"
            className="text-primary underline decoration-2 underline-offset-4 hover:text-accent"
          >
            {t('backToHome')}
          </Link>
        </p>
      </div>
    </main>
  );
}