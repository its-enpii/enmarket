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

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SUB_NAV = [
  { href: '/admin/settings', label: 'Site Identity', icon: '✎' },
  { href: '/admin/settings/payment', label: 'Payment', icon: '◊' },
  { href: '/admin/settings/maintenance', label: 'Maintenance', icon: '⚠' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
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
            <Link
              key={item.href}
              href={item.href}
              className={
                'inline-flex items-center gap-2 px-4 py-2 font-label text-label-sm uppercase font-bold border-2 transition-all min-h-[40px] ' +
                (active
                  ? 'bg-ink text-surface border-ink shadow-[3px_3px_0_0_var(--color-accent)]'
                  : 'bg-surface text-ink border-ink hover:bg-accent hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-ink)]')
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}