'use client';

import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { Button, NLink } from '@/components/ui/neobrutal';
import { Icon } from '@/components/ui';
import { CUSTOMER_TOKEN_COOKIE } from '@/lib/constants';
import { Children } from 'react';

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
  const [hasCustomerToken, setHasCustomerToken] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('nav');
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'enpiistudio';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const hasToken =
        new RegExp(`(^| )${CUSTOMER_TOKEN_COOKIE}=([^;]+)`).test(document.cookie) ||
        !!localStorage.getItem(CUSTOMER_TOKEN_COOKIE);
      setHasCustomerToken(hasToken);
    }
  }, [pathname]);

  // Lock body scroll saat mobile menu open (iOS Safari friendly).
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const navItems = [
    { key: 'discover', href: '/discover' },
    { key: 'develop', href: '/develop' },
    { key: 'display', href: '/display' },
    { key: 'layanan', href: '/layanan' },
    { key: 'topup', href: '/topup' },
  ] as const;

  return (
    <header className="sticky top-0 z-nav bg-surface border-b-4 border-ink shadow-brutal-6 relative">
      <div className="flex items-center justify-between gap-3 sm:gap-4 px-6 md:px-12 xl:px-8 2xl:px-12 py-4">
        <NLink
          href="/"
          variant="primary"
          underline="none"
          className="font-display text-2xl md:text-3xl xl:text-2xl 2xl:text-headline-md font-black uppercase tracking-tighter min-h-touch inline-flex items-center"
        >
          {siteName}
        </NLink>

        {/* Desktop nav (≥xl) */}
        <nav className="hidden xl:flex items-center gap-6 2xl:gap-8">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <NLink
                key={item.href}
                href={item.href}
                variant="primary"
                underline={active ? 'static' : 'hover'}
                aria-current={active ? 'page' : undefined}
                className={`font-label text-label-sm uppercase font-bold min-h-touch inline-flex items-center pb-1 ${
                  active ? 'border-b-4 border-primary' : ''
                }`}
              >
                {t(item.key)}
              </NLink>
            );
          })}
          {/* Wishlist & Cart: icon-only di desktop nav, berlabel di panel mobile */}
          <span className="flex items-center gap-2 [&_a]:w-11 [&_a]:h-11 [&_a]:justify-center [&_a]:px-0 [&_a]:py-0 [&_.badge-label]:hidden">
            {children}
          </span>
          {hasCustomerToken ? (
            <Button variant="primary" size="md" href="/akun">
              {t('account')}
            </Button>
          ) : (
            <Button variant="primary" size="md" href="/masuk">
              {t('login')}
            </Button>
          )}

          <NLink
            href="/login"
            className="font-label text-micro uppercase tracking-wider text-ink/60 hover:text-ink underline-offset-4 hover:underline"
          >
            {t('admin')}
          </NLink>
        </nav>

        {/* Right group (<xl): badges icon-only + hamburger */}
        <div className="flex items-center gap-2 xl:hidden [&_a]:w-11 [&_a]:h-11 [&_a]:justify-center [&_a]:px-0 [&_a]:py-0 [&_.badge-label]:hidden">
          {children}

          {/* Hamburger button (<xl) — pakai Button primitive standar */}
          <Button
            type="button"
            onClick={() => setOpen(!open)}
            variant="surface"
            size="sm"
            className="w-11 h-11 px-0 py-0 text-lg"
            aria-label={t('menu')}
            aria-expanded={open}
          >
            <Icon name={open ? 'close' : 'menu'} size={18} />
          </Button>
        </div>
      </div>

      {/* Mobile menu panel (<xl) */}
      {open && (
        <nav className="xl:hidden border-t-4 border-ink bg-surface">
          <div className="px-6 py-4 space-y-2">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Button
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  variant={active ? 'ink' : 'surface'}
                  size="md"
                  className={`relative flex items-center justify-between w-full ${
                    active ? 'pl-4 pr-3' : ''
                  }`}
                >
                  <span>{t(item.key)}</span>
                  {active ? (
                    <Icon name="arrow-right" size={16} className="shrink-0" />
                  ) : null}
                </Button>
              );
            })}

            {hasCustomerToken ? (
              <Button
                href="/akun"
                variant="primary"
                size="md"
                onClick={() => setOpen(false)}
                className="block text-center w-full"
              >
                {t('account')}
              </Button>
            ) : (
              <Button
                href="/masuk"
                variant="primary"
                size="md"
                onClick={() => setOpen(false)}
                className="block text-center w-full"
              >
                {t('login')}
              </Button>
            )}

            <NLink
              href="/login"
              onClick={() => setOpen(false)}
              className="block text-center w-full font-label text-micro uppercase tracking-wider text-ink/60 hover:text-ink underline-offset-4 hover:underline"
            >
              {t('admin')}
            </NLink>

            <p className="font-label text-micro uppercase tracking-wider text-ink/40">
              {t('quickMenu')}
            </p>
          </div>
        </nav>
      )}
    </header>
  );
}
