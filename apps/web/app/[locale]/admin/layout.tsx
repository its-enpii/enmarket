/**
 * Layout untuk /admin/*.
 * - Server Component, verifikasi token ke Laravel /api/admin/me
 * - Render AdminShell (client component) untuk drawer state + Sidebar
 *   + baca pathname via usePathname() (headers() tidak expose path di App Router).
 *
 * Catatan: tidak boleh modify cookie dari Server Component.
 * Middleware (middleware.ts) sudah redirect ke /login kalau tidak ada cookie.
 * Layout cukup check ke API; kalau gagal, redirect saja.
 */

import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';

import { AdminShell } from '@/components/admin/AdminShell';
import { ApiRequestError, apiFetch } from '@/lib/api';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await apiFetch<{ authenticated: boolean }>('/api/admin/me');
  } catch (err) {
    if (err instanceof ApiRequestError) {
      const locale = await getLocale();
      redirect({ pathname: '/login', locale });
    }
    throw err;
  }

  return <AdminShell>{children}</AdminShell>;
}