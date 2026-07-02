/**
 * Layout untuk /admin/*.
 * - Server Component, verifikasi token ke Laravel /api/admin/me
 * - Render Sidebar + konten
 *
 * Catatan: tidak boleh modify cookie dari Server Component.
 * Middleware (middleware.ts) sudah redirect ke /login kalau tidak ada cookie.
 * Layout cukup check ke API; kalau gagal, redirect saja (browser akan
 * keep-trying karena cookie masih ada sampai expired / cleared manual).
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { Sidebar } from '@/components/admin/Sidebar';
import { ApiRequestError, apiFetch } from '@/lib/api';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await apiFetch<{ authenticated: boolean }>('/api/admin/me');
  } catch (err) {
    // Auth gagal — redirect ke /login.
    // Cookie invalid akan di-clear oleh user via logout atau expired otomatis.
    if (err instanceof ApiRequestError) {
      redirect('/login');
    }
    // Network / unknown error — tampilkan error UI
    throw err;
  }

  // Ambil current pathname dari header (x-invoke-path diset Next 15)
  const h = await headers();
  const currentPath = h.get('x-invoke-path') ?? h.get('next-url') ?? '/admin';

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar currentPath={currentPath} />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}