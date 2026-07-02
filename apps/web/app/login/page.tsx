/**
 * Halaman login admin.
 * Server Component — cek existing cookie & render form.
 * Cookie deletion tidak bisa di sini; biarkan expired/ditimpa lewat login ulang.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { apiFetch } from '@/lib/api';
import { LoginForm } from './LoginForm';

import { loginAction } from './actions';

export const metadata = {
  title: 'Login — enpiistudio Store',
};

export default async function LoginPage() {
  // Kalau sudah ada cookie valid, redirect ke /admin
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
      // Token invalid/expired — biarkan, akan ditimpa oleh login berikutnya.
    }
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-surface border-4 border-ink p-8 shadow-[8px_8px_0_0_var(--color-ink)]">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            enpiistudio Admin
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink">
            Login Dashboard
          </h1>
          <p className="mt-2 text-sm text-ink/70">
            Masukkan admin token untuk masuk.
          </p>

          <LoginForm action={loginAction} />
        </div>

        <p className="mt-6 text-center text-sm">
          <a
            href="/"
            className="text-primary underline decoration-2 underline-offset-4 hover:text-accent"
          >
            ← Kembali ke beranda
          </a>
        </p>
      </div>
    </main>
  );
}