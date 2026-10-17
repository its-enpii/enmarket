'use client';

import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import { Button, DotMatrix, Eyebrow, NLink } from '@/components/ui/neobrutal';
import { Icon } from '@/components/ui';
import { LocaleSwitcher } from '@/components/public/LocaleSwitcher';
import { DEFAULT_NAV_ITEMS, normalizeNavMenus } from '@/lib/nav-menus';
import type { NavMenuItem } from '@/lib/nav-menus';

// id stabil untuk aria-controls (Drawer panel). Const lokal, bukan crypto.randomUUID.
const MOBILE_PANEL_ID = 'mobile-nav-panel';

interface Props {
  children?: ReactNode;
}

/**
 * TopNav publik — Neobrutalism EnStudio.
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
  const [navItems, setNavItems] = useState<NavMenuItem[]>(
    DEFAULT_NAV_ITEMS.map((item) => ({ ...item, label: null })),
  );
  const pathname = usePathname();
  const t = useTranslations('nav');
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'EnStudio';

  // Lock body scroll saat mobile menu open (iOS Safari friendly).
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Tutup drawer dengan Escape (pola sama dengan scroll-lock di atas).
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/public/site-config')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<{ data?: { nav_menus?: unknown } }>;
      })
      .then((payload) => {
        if (cancelled) return;
        const menus = normalizeNavMenus(payload.data?.nav_menus);
        setNavItems(menus.length > 0 ? menus : DEFAULT_NAV_ITEMS.map((item) => ({ ...item, label: null })));
      })
      .catch(() => {
        if (!cancelled) {
          setNavItems(DEFAULT_NAV_ITEMS.map((item) => ({ ...item, label: null })));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="sticky top-0 z-nav bg-surface border-b-4 border-ink shadow-brutal-6 relative">
      <div className="flex items-center justify-between gap-3 sm:gap-4 px-6 md:px-12 xl:px-8 2xl:px-12 py-2.5">
        <NLink
          href="/"
          aria-label={siteName}
          underline="none"
          className="min-h-touch inline-flex items-center"
        >
          <Image
            src="/logo/enstudio-wordmark.png"
            alt="EnStudio"
            width={2172}
            height={724}
            priority
            className="h-9 md:h-11 w-auto"
          />
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
                  active ? 'border-b-4 border-ink text-ink font-black' : ''
                }`}
              >
                {item.label ?? t(item.key)}
              </NLink>
            );
          })}
          {/* Wishlist & Cart: icon-only di desktop nav, berlabel di panel mobile */}
          <span className="flex items-center gap-2 [&_a]:w-11 [&_a]:h-11 [&_a]:justify-center [&_a]:px-0 [&_a]:py-0 [&_.badge-label]:hidden">
            {children}
          </span>
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
            size="icon"
            aria-label={t('menu')}
            aria-expanded={open}
            aria-controls={MOBILE_PANEL_ID}
          >
            <Icon name={open ? 'close' : 'menu'} size={18} />
          </Button>
        </div>
      </div>

      {/* Mobile drawer (<xl): backdrop + panel overlay, tidak mendorong <main> */}
      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-x-0 top-[68px] bottom-0 z-backdrop bg-ink/40"
        />
      )}
      {open && (
        <nav
          id={MOBILE_PANEL_ID}
          className="absolute inset-x-0 top-full z-nav xl:hidden border-b-4 border-ink bg-surface shadow-brutal-6 animate-pop-in max-h-[calc(100dvh-68px)] overflow-y-auto"
        >
          {/* Header panel — label boxed (Nighthawks) + dot-matrix ornamen #1 */}
          <div className="flex items-center justify-between border-b-2 border-ink px-6 py-3">
            <div className="inline-flex border-2 border-ink bg-surface px-2 py-1">
              <Eyebrow size="sm" color="ink-muted">
                {t('quickMenu')}
              </Eyebrow>
            </div>
            <DotMatrix rows={2} cols={8} color="accent" />
          </div>

          {/* Zona navigasi — tipografi display raksasa, garis putus-putus (FC88).
              Watermark di belakangnya = ornamen #2 (murni tekstur). */}
          <div className="relative overflow-hidden px-6 pt-4">
            <span
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-0 grid place-items-center font-display text-headline-xl uppercase leading-none text-ink/[0.06]"
            >
              MENU
            </span>
            <div className="relative flex flex-col pb-4">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <div
                    key={item.href}
                    className="border-b-2 border-dashed border-ink last:border-b-0"
                  >
                    <Button
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      variant={active ? 'accent' : 'surface'}
                      size="md"
                      fullWidth
                      className={`min-h-[64px] !border-0 justify-start gap-4 px-4 text-left ${
                        active
                          ? '!shadow-brutal-2 translate-x-1'
                          : '!bg-transparent !shadow-none hover:bg-ink/5 hover:shadow-brutal-2'
                      }`}
                    >
                      <span className="flex-1 font-display text-headline-lg-mobile uppercase leading-none text-ink">
                        {item.label ?? t(item.key)}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`w-11 h-11 grid place-items-center shrink-0 border-2 border-ink ${
                          active ? 'bg-ink text-surface' : 'bg-surface text-ink'
                        }`}
                      >
                        <Icon name="arrow-right" size={18} />
                      </span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider solid */}
          <div className="border-t-2 border-ink" />

          {/* Zona bawah — preferensi + CTA, tetap putih */}
          <div className="flex items-center justify-between px-6 py-4">
            <LocaleSwitcher />
            <DotMatrix rows={1} cols={6} color="ink" />
          </div>

          <div className="px-6 pb-6">
            <Button
              href="/login"
              onClick={() => setOpen(false)}
              variant="ink"
              size="md"
              fullWidth
            >
              {t('admin')}
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
