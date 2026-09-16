'use client';

import { useTranslations } from 'next-intl';

import { Button, Eyebrow, NLink } from '@/components/ui/neobrutal';
import { routing } from '@/i18n/routing';

import { Icon } from '@/components/ui';

interface NavItem {
  /** Key di `admin.nav.*` untuk label link. */
  key: string;
  href: string;
  icon: string;
}

interface NavGroup {
  /** Key di `admin.sidebar.*` untuk header kelompok. */
  labelKey: string;
  items: NavItem[];
}

/**
 * Kelompok navigasi admin — urutan = urutan render di sidebar.
 * Satu kelompok per domain kerja supaya 13 menu tidak jadi satu list panjang.
 */
const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: 'groupMain',
    items: [
      { key: 'dashboard', href: '/admin', icon: '▤' },
    ],
  },
  {
    labelKey: 'groupCatalog',
    items: [
      { key: 'products', href: '/admin/products', icon: '📦' },
      { key: 'categories', href: '/admin/categories', icon: '📂' },
      { key: 'preorders', href: '/admin/preorders', icon: '◷' },
      { key: 'customRequests', href: '/admin/custom-requests', icon: '🛠' },
      { key: 'licenseKeys', href: '/admin/license-keys', icon: '🔑' },
    ],
  },
  {
    labelKey: 'groupDisplay',
    items: [
      { key: 'posts', href: '/admin/posts', icon: '📝' },
    ],
  },
  {
    labelKey: 'groupSales',
    items: [
      { key: 'orders', href: '/admin/orders', icon: '💳' },
      { key: 'coupons', href: '/admin/coupons', icon: '🏷' },
      { key: 'reviews', href: '/admin/reviews', icon: '★' },
      { key: 'sponsors', href: '/admin/sponsors', icon: '✨' },
    ],
  },
  {
    labelKey: 'groupSystem',
    items: [
      { key: 'media', href: '/admin/media', icon: '🖼' },
      { key: 'settings', href: '/admin/settings', icon: '⚙' },
    ],
  },
];

interface Props {
  currentPath: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Sidebar admin — fixed di lg+, drawer overlay di mobile.
 * State controlled dari parent (AdminShell).
 *
 * Menu dikelompokkan per domain kerja (lihat NAV_GROUPS); tiap kelompok dibuka
 * dengan header `Eyebrow` sebagai pemisah visual.
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

  return (
    <>
      {/* Backdrop untuk mobile */}
      {open && (
        <Button
          type="button"
          variant="surface"
          size="sm"
          aria-label={tSidebar('closeMenu')}
          onClick={onClose}
          className="lg:hidden fixed inset-0 px-0 py-0 bg-ink/60 z-backdrop cursor-default"
        />
      )}
      {/* Sidebar — fixed position.
          - mobile: drawer overlay (translate-x animate)
          - lg+:    fixed left, tetap di tempat saat main scroll. */}
      <aside
        className={
          'fixed inset-y-0 left-0 z-nav w-64 bg-primary border-r-4 border-ink ' +
          'flex flex-col transform transition-transform duration-200 ' +
          (open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
        }
      >
        <div className="p-6 border-b-2 border-ink flex items-center justify-between">
          <NLink href="/admin" onClick={onClose} underline="none" className="block">
            <Eyebrow size="md" color="accent" className="text-xs tracking-label">
              {tSidebar('brandTitle')}
            </Eyebrow>
            <p className="text-2xl font-bold text-surface leading-none mt-1">
              {tSidebar('brandSubtitle')}
            </p>
          </NLink>
          {/* Close button (mobile only) */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            flat
            borderColor="surface"
            textColor="surface"
            onClick={onClose}
            className="lg:hidden"
            srLabel={tSidebar('closeMenu')}
          >
            <Icon name="close" size={14} />
          </Button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="flex flex-col gap-5">
          {NAV_GROUPS.map((group) => (
            <section key={group.labelKey} className="flex flex-col gap-1">
              <Eyebrow
                as="h2"
                size="micro"
                color="surface-soft"
                className="px-4 pt-1 pb-2"
              >
                {tSidebar(group.labelKey)}
              </Eyebrow>
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active =
                    item.href === '/admin'
                      ? path === '/admin'
                      : path.startsWith(item.href);

                  return (
                    <li key={item.key}>
                      <NLink
                        href={item.href}
                        variant="default"
                        underline="none"
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className={
                          'flex items-center gap-3 px-4 py-3 text-sm font-bold border-2 transition-all min-h-touch w-full ' +
                          (active
                            ? 'bg-accent text-ink border-ink !shadow-brutal-4 translate-x-[-1px] translate-y-[-1px]'
                            : 'bg-transparent text-surface border-transparent hover:border-ink hover:bg-accent hover:text-ink')
                        }
                      >
                        <span className="text-lg" aria-hidden="true">
                          {item.icon}
                        </span>
                        {t(`nav.${item.key}`)}
                      </NLink>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          </div>
        </nav>

        <div className="p-4 border-t-2 border-ink">
          <NLink
            href="/"
            variant="on-dark"
            underline="none"
            className="text-xs font-bold uppercase tracking-wide min-h-touch inline-flex items-center"
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
      <Icon name="menu" size={18} />
    </Button>
  );
}
