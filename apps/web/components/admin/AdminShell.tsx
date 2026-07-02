'use client';

import { useState } from 'react';

import { Sidebar } from './Sidebar';
import { AdminDrawerContext } from './AdminDrawerContext';

/**
 * Client wrapper untuk layout admin. Mengelola state drawer (mobile).
 * Server Component (layout) bisa render ini tanpa harus ubah ke client.
 */
export function AdminShell({
  currentPath,
  children,
}: {
  currentPath: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <AdminDrawerContext.Provider value={{ openDrawer: () => setOpen(true) }}>
      <div className="min-h-screen bg-surface flex">
        <Sidebar currentPath={currentPath} open={open} onClose={() => setOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">{children}</div>
      </div>
    </AdminDrawerContext.Provider>
  );
}