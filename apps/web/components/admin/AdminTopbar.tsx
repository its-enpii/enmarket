'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { logoutAction } from '@/app/admin/actions';
import { useAdminDrawer } from './AdminDrawerContext';

/**
 * Mapping pathname → human title untuk AdminTopbar.
 * Kalau pathname tidak match, fallback ke segment terakhir (formatted).
 */
const PATH_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/admin': { title: 'Beranda', subtitle: 'Ringkasan toko digital enpiistudio.' },
  '/admin/products': { title: 'Produk', subtitle: 'Kelola semua produk di katalog.' },
  '/admin/categories': { title: 'Kategori', subtitle: 'Kelompokkan produk per kategori.' },
  '/admin/orders': { title: 'Pesanan', subtitle: 'Daftar pesanan masuk.' },
  '/admin/license-keys': { title: 'License Keys', subtitle: 'Pool license key untuk produk digital.' },
};

function formatSlug(s: string): string {
  return s
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveTitle(pathname: string): { title: string; subtitle?: string } {
  if (PATH_TITLES[pathname]) return PATH_TITLES[pathname];

  // Match dynamic segments — e.g. /admin/products/new, /admin/products/3, dll
  // Beri title generik.
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  const parent = segments.length > 1 ? segments[segments.length - 2] : null;

  if (parent && PATH_TITLES['/admin/' + parent]) {
    const base = PATH_TITLES['/admin/' + parent].title;
    return {
      title: `${base} — ${formatSlug(last)}`,
    };
  }
  return { title: formatSlug(last ?? 'Admin') };
}

/**
 * AdminTopbar — single topbar di layout AdminShell (bukan per-page).
 * Title auto-resolve dari pathname. Logout button di kanan.
 */
export function AdminTopbar() {
  const pathname = usePathname();
  const drawer = useAdminDrawer();
  const { title, subtitle } = resolveTitle(pathname ?? '/admin');

  return (
    <header className="bg-surface border-b-4 border-ink px-4 sm:px-8 py-5 flex items-center justify-between gap-3 sticky top-0 z-30">
      <div className="flex items-center gap-2 min-w-0">
        {drawer && (
          <button
            type="button"
            onClick={() => drawer.openDrawer()}
            aria-label="Open menu"
            className="lg:hidden border-2 border-ink bg-surface text-ink w-11 h-11 inline-flex items-center justify-center font-bold shadow-[3px_3px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--color-ink)] transition-all"
          >
            ☰
          </button>
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
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex border-2 border-ink bg-surface px-3 py-2 text-sm font-bold text-ink shadow-[3px_3px_0_0_var(--color-ink)] hover:bg-accent hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-ink)] transition-all min-h-[44px] items-center"
        >
          ← Toko
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="border-2 border-ink bg-surface px-3 sm:px-4 py-2 text-sm font-bold text-ink shadow-[3px_3px_0_0_var(--color-ink)] hover:bg-accent hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-ink)] transition-all min-h-[44px]"
          >
            Logout
          </button>
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