'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';

import { logoutAction } from '@/app/[locale]/admin/actions';
import { useAdminDrawer } from './AdminDrawerContext';

type TitleKey =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'preorders'
  | 'posts'
  | 'licenseKeys'
  | 'media'
  | 'settings'
  | 'settingsPayment'
  | 'settingsMaintenance';

const PATH_KEYS: Record<string, TitleKey> = {
  '/admin': 'dashboard',
  '/admin/products': 'products',
  '/admin/categories': 'categories',
  '/admin/orders': 'orders',
  '/admin/preorders': 'preorders',
  '/admin/posts': 'posts',
  '/admin/license-keys': 'licenseKeys',
  '/admin/media': 'media',
  '/admin/settings': 'settings',
  '/admin/settings/payment': 'settingsPayment',
  '/admin/settings/maintenance': 'settingsMaintenance',
};

function formatSlug(s: string): string {
  return s
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * AdminTopbar — single topbar di layout AdminShell (bukan per-page).
 * Title auto-resolve dari pathname. Logout button di kanan.
 */
export function AdminTopbar() {
  const tTitles = useTranslations('admin.topbarTitles');
  const tTopbar = useTranslations('admin.topbar');
  const tSidebar = useTranslations('admin.sidebar');
  const pathname = usePathname();
  const drawer = useAdminDrawer();

  // Strip locale prefix (e.g. /en/admin/products → /admin/products).
  const cleanPath = pathname?.replace(/^\/(id|en)(?=\/)/, '') ?? '/admin';
  const key = PATH_KEYS[cleanPath];

  let title: string;
  let subtitle: string | undefined;
  if (key) {
    title = tTitles(key);
    // Subtitle keys map 1:1 — try, fall back silently if missing.
    try {
      subtitle = tTitles(`${key}Subtitle` as `${TitleKey}Subtitle`);
    } catch {
      subtitle = undefined;
    }
  } else {
    const segments = cleanPath.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    const parent = segments.length > 1 ? segments[segments.length - 2] : null;

    if (parent && PATH_KEYS['/admin/' + parent]) {
      const baseKey = PATH_KEYS['/admin/' + parent];
      title = `${tTitles(baseKey)} — ${formatSlug(last ?? '')}`;
    } else {
      title = formatSlug(last ?? tTitles('fallback'));
    }
  }

  return (
    <header className="bg-surface border-b-4 border-ink px-4 sm:px-8 py-5 flex items-center justify-between gap-3 sticky top-0 z-30">
      <div className="flex items-center gap-2 min-w-0">
        {drawer && (
          <Button
            variant="surface"
            size="sm"
            type="button"
            onClick={() => drawer.openDrawer()}
            aria-label={tSidebar('openMenu')}
            className="lg:hidden w-11 h-11 px-0 py-0"
          >
            ☰
          </Button>
        )}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-ink leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-ink/60 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="surface"
          size="sm"
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center justify-center hover:bg-accent"
        >
          {tTopbar('viewSite')}
        </Button>
        <form action={logoutAction}>
          <Button variant="surface" size="sm" type="submit" className="hover:bg-accent">
            {tTopbar('logout')}
          </Button>
        </form>
      </div>
    </header>
  );
}

/** Skeleton topbar untuk loading.tsx — pakai sebagai substitute. */
export function TopbarSkeleton() {
  return (
    <header className="bg-surface border-b-4 border-ink px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
      <div className="flex-1 max-w-md space-y-2 animate-pulse">
        <div className="h-5 w-40 bg-ink/10" />
        <div className="h-3 w-64 bg-ink/10" />
      </div>
      <div className="w-20 h-9 bg-ink/10 animate-pulse" />
    </header>
  );
}