'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { NLink } from '@/components/ui/neobrutal';
import { routing } from '@/i18n/routing';

const NAV_HREFS = [
  '/admin',
  '/admin/categories',
  '/admin/products',
  '/admin/posts',
  '/admin/orders',
  '/admin/preorders',
  '/admin/license-keys',
  '/admin/media',
  '/admin/settings',
] as const;

const NAV_ICONS = ['◆', '◧', '▤', '✎', '◊', '◷', '⚷', '◰', '⚙'];

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
  const t = useTranslations('admin');
  const tSidebar = useTranslations('admin.sidebar');
  // usePathname() returns path with locale prefix (e.g. /en/admin/...). Strip it
  // so href matching against `/admin/...` works for nested routes too.
  const path = currentPath.replace(
    new RegExp(`^/(${routing.locales.join('|')})`),
    '',
  ) || '/';

  const navKeys = ['dashboard', 'categories', 'products', 'posts', 'orders', 'preorders', 'licenseKeys', 'media', 'settings'] as const;

  return (
    <>
      {/* Backdrop untuk mobile */}
      {open && (
        <button
          type="button"
          aria-label={tSidebar('closeMenu')}
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-ink/60 z-40 cursor-default"
        />
      )}

      {/* Sidebar — fixed position.
          - mobile: drawer overlay (translate-x animate)
          - lg+:    fixed left, tetap di tempat saat main scroll. */}
      <aside
        className={
          'fixed inset-y-0 left-0 z-50 w-64 bg-primary border-r-4 border-ink ' +
          'flex flex-col transform transition-transform duration-200 ' +
          (open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
        }
      >
        <div className="p-6 border-b-2 border-ink flex items-center justify-between">
          <Link href="/admin" onClick={onClose} className="block">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
              {tSidebar('brandTitle')}
            </p>
            <p className="text-2xl font-bold text-surface leading-none mt-1">
              {tSidebar('brandSubtitle')}
            </p>
          </Link>
          {/* Close button (mobile only) */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            flat
            onClick={onClose}
            className="lg:hidden !w-11 !h-11 !px-0 !py-0 !text-2xl !border-surface !text-surface"
            srLabel={tSidebar('closeMenu')}
          >
            ✕
          </Button>
        </div>

        <nav className="flex-1 p-3">
          <ul className="flex flex-col gap-1">
          {NAV_HREFS.map((href, idx) => {
            const active =
              href === '/admin'
                ? path === '/admin'
                : path.startsWith(href);

            return (
              <li key={href}>
                <NLink
                  href={href}
                  variant="default"
                  underline="none"
                  onClick={onClose}
                  className={
                    'flex items-center gap-3 px-4 py-3 text-sm font-bold border-2 transition-all min-h-[44px] w-full ' +
                    (active
                      ? 'bg-accent text-ink border-ink shadow-[4px_4px_0_0_var(--color-ink)] translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-transparent text-surface border-transparent hover:border-ink hover:bg-accent hover:text-ink')
                  }
                >
                  <span className="text-lg">{NAV_ICONS[idx]}</span>
                  {t(`nav.${navKeys[idx]}`)}
                </NLink>
              </li>
            );
          })}
          </ul>
        </nav>

        <div className="p-4 border-t-2 border-ink">
          <NLink
            href="/"
            variant="on-dark"
            underline="none"
            className="text-xs font-bold uppercase tracking-wide min-h-[44px] inline-flex items-center"
          >
            {tSidebar('viewStore')}
          </NLink>
        </div>
      </aside>
    </>
  );
}

/**
 * Toggle button untuk sidebar (dipakai di Topbar mobile).
 */
export function SidebarToggle({ onClick }: { onClick: () => void }) {
  const tSidebar = useTranslations('admin.sidebar');
  return (
    <Button
      variant="surface"
      size="sm"
      type="button"
      onClick={onClick}
      aria-label={tSidebar('openMenu')}
      className="lg:hidden w-11 h-11 px-0 py-0 mr-2"
    >
      ☰
    </Button>
  );
}