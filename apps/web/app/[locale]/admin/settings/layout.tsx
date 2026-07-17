/**
 * Settings layout — sub-nav untuk 3 halaman settings:
 *   - /admin/settings         → Site Identity
 *   - /admin/settings/payment → Payment & Gateway
 *   - /admin/settings/maintenance → Maintenance
 *
 * Pakai Link biasa (bukan Tab pattern) — biar URL shareable + back button works.
 *
 * Backend: SettingsController + MaintenanceController (lihat apps/api routes/api.php)
 * Persistence penuh — submit form ke real endpoint, revalidate cache, toast feedback.
 */

'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/admin/Button';

interface NavItem {
  href: string;
  labelKey: 'identity' | 'payment' | 'maintenance';
  icon: string;
}

const SUB_NAV: NavItem[] = [
  { href: '/admin/settings', labelKey: 'identity', icon: '✎' },
  { href: '/admin/settings/payment', labelKey: 'payment', icon: '◊' },
  { href: '/admin/settings/maintenance', labelKey: 'maintenance', icon: '⚠' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('admin.settingsNav');
  const pathname = usePathname() ?? '/admin/settings';

  return (
    <div className="px-6 sm:px-8 pt-8 pb-6 space-y-8">
      {/* Sub-nav */}
      <nav className="flex flex-wrap gap-2 border-b-4 border-ink pb-4">
        {SUB_NAV.map((item) => {
          const active =
            item.href === '/admin/settings'
              ? pathname === '/admin/settings'
              : pathname.startsWith(item.href);
          return (
            <Button
              key={item.href}
              href={item.href}
              size="sm"
              variant={active ? 'ink' : 'surface'}
              shadowColor={active ? 'accent' : 'ink'}
              className="inline-flex items-center gap-2"
            >
              <span aria-hidden="true">{item.icon}</span>
              {t(item.labelKey)}
            </Button>
          );
        })}
      </nav>

      {children}
    </div>
  );
}