/**
 * Layout untuk /admin/*.
 * - Server Component, verifikasi token ke Laravel /api/admin/me
 * - Render AdminShell (client component) untuk drawer state + Sidebar
 *
 * Catatan: tidak boleh modify cookie dari Server Component.
 * Middleware (middleware.ts) sudah redirect ke /login kalau tidak ada cookie.
 * Layout cukup check ke API; kalau gagal, redirect saja.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

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
      redirect('/login');
    }
    throw err;
  }

  const h = await headers();
  const currentPath = h.get('x-invoke-path') ?? h.get('next-url') ?? '/admin';

  return <AdminShell currentPath={currentPath}>{children}</AdminShell>;
}