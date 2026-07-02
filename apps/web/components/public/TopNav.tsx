'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface Props {
  children?: ReactNode; // slot untuk client-safe content (mis. CartBadge text)
}

/**
 * TopNav publik — logo + Katalog + Cart slot + Admin link.
 * Hamburger menu pada viewport < sm.
 */
export function TopNav({ children }: Props) {
  const [open, setOpen] = useState(false);
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'enpiistudio Store';

  return (
    <header className="border-b-4 border-ink bg-surface relative">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight text-ink hover:text-primary transition-colors min-h-[44px]"
        >
          <span className="bg-primary text-surface border-2 border-ink px-2 py-0.5 text-sm">
            enpii
          </span>
          <span className="hidden sm:inline">{siteName}</span>
        </Link>

        {/* Desktop nav (≥ sm) */}
        <nav className="hidden sm:flex items-center gap-2 sm:gap-3">
          <Link
            href="/katalog"
            className="px-3 py-2 text-sm font-bold text-ink hover:text-primary transition-colors min-h-[44px] inline-flex items-center"
          >
            Katalog
          </Link>
          {children}
          <Link
            href="/login"
            className="bg-ink text-surface border-2 border-ink px-3 py-1.5 text-sm font-bold shadow-[3px_3px_0_0_var(--color-primary)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_var(--color-primary)] transition-all min-h-[44px] inline-flex items-center"
          >
            Admin
          </Link>
        </nav>

        {/* Hamburger button (< sm) */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="sm:hidden border-2 border-ink bg-surface text-ink w-11 h-11 flex items-center justify-center font-bold shadow-[3px_3px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--color-ink)] transition-all"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <nav className="sm:hidden border-t-2 border-ink bg-surface">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/katalog"
              onClick={() => setOpen(false)}
              className="block px-3 py-3 text-base font-bold text-ink hover:bg-accent border-2 border-transparent hover:border-ink transition-all min-h-[44px]"
            >
              Katalog
            </Link>
            <Link
              href="/keranjang"
              onClick={() => setOpen(false)}
              className="block px-3 py-3 text-base font-bold text-ink hover:bg-accent border-2 border-transparent hover:border-ink transition-all min-h-[44px]"
            >
              🛒 Keranjang
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block px-3 py-3 text-base font-bold bg-ink text-surface border-2 border-ink text-center shadow-[3px_3px_0_0_var(--color-primary)] min-h-[44px] leading-[44px]"
            >
              Admin
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}