/**
 * Halaman login admin — translated.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { Card, NLink } from '@/components/ui/neobrutal';
import { apiFetch } from '@/lib/api';
import { LoginForm } from './LoginForm';

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
        <Card variant="surface" hoverable={false} thick className="p-8" style={{ boxShadow: '8px 8px 0 0 var(--color-ink)' }}>
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
        </Card>

        <p className="mt-6 text-center text-sm">
          <NLink
            href="/"
            variant="primary"
            underline="static"
          >
            {t('backToHome')}
          </NLink>
        </p>
      </div>
    </main>
  );
}