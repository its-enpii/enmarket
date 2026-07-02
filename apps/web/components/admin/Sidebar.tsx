'use client';

import Link from 'next/link';
import { useState } from 'react';

const NAV = [
  { href: '/admin', label: 'Beranda', icon: '◆' },
  { href: '/admin/products', label: 'Produk', icon: '▤' },
  { href: '/admin/categories', label: 'Kategori', icon: '◧' },
  { href: '/admin/orders', label: 'Pesanan', icon: '◊' },
  { href: '/admin/license-keys', label: 'Lisensi', icon: '⚷' },
];

interface Props {
  currentPath: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Sidebar admin — fixed di lg+, drawer overlay di mobile.
 * State controlled dari parent (AdminShell).
 */
export function Sidebar({ currentPath, open, onClose }: Props) {
  return (
    <>
      {/* Backdrop untuk mobile */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-ink/60 z-40 cursor-default"
        />
      )}

      {/* Sidebar — drawer di mobile, fixed di lg+ */}
      <aside
        className={
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary border-r-4 border-ink ' +
          'flex flex-col transform transition-transform duration-200 ' +
          (open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
        }
      >
        <div className="p-6 border-b-2 border-ink flex items-center justify-between">
          <Link href="/admin" onClick={onClose} className="block">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
              enpiistudio
            </p>
            <p className="text-2xl font-bold text-surface leading-none mt-1">
              Admin
            </p>
          </Link>
          {/* Close button (mobile only) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden text-surface text-2xl w-11 h-11 inline-flex items-center justify-center border-2 border-surface"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const active =
              item.href === '/admin'
                ? currentPath === '/admin'
                : currentPath.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={
                  'flex items-center gap-3 px-4 py-3 text-sm font-bold border-2 transition-all min-h-[44px] ' +
                  (active
                    ? 'bg-accent text-ink border-ink shadow-[4px_4px_0_0_var(--color-ink)] translate-x-[-1px] translate-y-[-1px]'
                    : 'bg-transparent text-surface border-transparent hover:border-ink hover:bg-accent hover:text-ink')
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t-2 border-ink">
          <Link
            href="/"
            className="block text-xs font-bold uppercase tracking-wide text-surface/70 hover:text-accent min-h-[44px] inline-flex items-center"
          >
            ← Lihat Toko
          </Link>
        </div>
      </aside>
    </>
  );
}

/**
 * Toggle button untuk sidebar (dipakai di Topbar mobile).
 */
export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open menu"
      className="lg:hidden border-2 border-ink bg-surface text-ink w-11 h-11 flex items-center justify-center font-bold shadow-[3px_3px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--color-ink)] transition-all mr-2"
    >
      ☰
    </button>
  );
}