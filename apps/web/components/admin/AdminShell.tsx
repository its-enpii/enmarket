'use client';

import { useState } from 'react';
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
 */
export function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const currentPath = usePathname() ?? '/admin';

  return (
    <AdminDrawerContext.Provider value={{ openDrawer: () => setOpen(true) }}>
      <div className="min-h-screen bg-surface">
        <Sidebar currentPath={currentPath} open={open} onClose={() => setOpen(false)} />
        <div className="flex flex-col min-h-screen lg:pl-64">
          <AdminTopbar />
          <div className="flex-1">{children}</div>
          <AdminFooter />
        </div>
      </div>
    </AdminDrawerContext.Provider>
  );
}