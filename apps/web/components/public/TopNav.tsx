'use client';

import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/neobrutal';
import { NLink } from '@/components/ui/neobrutal';
import { LocaleSwitcher } from '@/components/public/LocaleSwitcher';

interface Props {
  children?: ReactNode;
}

/**
 * TopNav publik — Neobrutalism enpiistudio.
 * Locale-aware: pakai next-intl `useTranslations` + `usePathname` (path TANPA prefix).
 */

// usePathname dari i18n/navigation return path TANPA locale prefix.
// isActive cukup compare pathname dengan href (keduanya sudah locale-stripped).
function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href.startsWith('/#')) return false;
  const [targetPath] = href.split('?');
  if (pathname === targetPath) return true;
  if (targetPath && pathname.startsWith(targetPath + '/')) return true;
  return false;
}

export function TopNav({ children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('nav');
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'enpiistudio';

  const navItems = [
    { key: 'discover', href: '/discover' },
    { key: 'develop', href: '/develop' },
    { key: 'display', href: '/display' },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-surface border-b-4 border-ink neobrutal-shadow relative">
      <div className="flex items-center justify-between gap-3 sm:gap-4 px-6 md:px-12 py-4">
        <NLink
          href="/"
          variant="default"
          underline="none"
          className="font-display text-headline-md font-black uppercase tracking-tighter min-h-[44px] inline-flex items-center text-2xl"
        >
          {siteName}
        </NLink>

        {/* Desktop nav (≥md) */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <NLink
                key={item.href}
                href={item.href}
                variant="default"
                underline={active ? 'static' : 'hover'}
                aria-current={active ? 'page' : undefined}
                className={`font-label text-label-sm uppercase font-bold min-h-[44px] inline-flex items-center pb-1 ${
                  active ? 'border-b-4 border-primary' : ''
                }`}
              >
                {t(item.key)}
              </NLink>
            );
          })}
          {children}
          <LocaleSwitcher />
          <Button variant="surface" size="sm" href="/login">
            {t('admin')}
          </Button>
        </nav>

        {/* Hamburger button (<md) */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden neobrutal-border bg-surface text-ink w-11 h-11 flex items-center justify-center font-bold neobrutal-shadow active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--color-ink)] transition-all"
          aria-label={t('menu')}
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <nav className="md:hidden border-t-4 border-ink bg-surface">
          <div className="px-6 py-4 space-y-2">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`block px-3 py-3 font-label text-base font-bold uppercase border-2 transition-all min-h-[44px] ${
                    active
                      ? 'bg-primary/10 text-primary border-primary'
                      : 'text-ink border-transparent hover:bg-accent hover:border-ink'
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}
            <div className="px-3 py-2">
              <LocaleSwitcher />
            </div>
            <Button
              href="/login"
              variant="surface"
              size="md"
              onClick={() => setOpen(false)}
              className="block text-center w-full"
            >
              {t('admin')}
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}