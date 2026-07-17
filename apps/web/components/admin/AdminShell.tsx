'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { Sidebar } from './Sidebar';
import { AdminTopbar } from './AdminTopbar';
import { AdminFooter } from './AdminFooter';
import { AdminDrawerContext } from './AdminDrawerContext';

/**
 * Client wrapper untuk layout admin. Mengelola state drawer (mobile)
 * + baca pathname aktif dari usePathname() (App Router tidak expose
 * pathname ke Server Component via headers()).
 *
 * Layout: Sidebar (fixed kiri) | main column (Topbar + Content + Footer)
 *
 * Mobile UX:
 * - `overflow-x-hidden` di outer wrapper agar table lebar / <pre> code tidak
 *   trigger horizontal scroll body.
 * - Saat drawer open: lock body scroll (iOS Safari bug-friendly: konten di
 *   belakang drawer tetap visible karena backdrop fixed, tapi scroll
 *   behavior masih hidup → dengan lock, user tidak bisa scroll konten
 *   "di belakang" drawer).
 */
export function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const currentPath = usePathname() ?? '/admin';

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AdminDrawerContext.Provider value={{ openDrawer: () => setOpen(true) }}>
      <div className="min-h-screen bg-surface overflow-x-hidden">
        <Sidebar currentPath={currentPath} open={open} onClose={() => setOpen(false)} />
        <div className="flex flex-col min-h-screen lg:pl-64">
          <AdminTopbar />
          <main className="flex-1">{children}</main>
          <AdminFooter />
        </div>
      </div>
    </AdminDrawerContext.Provider>
  );
}