'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useAuth } from './AuthProvider';
import { Card } from '@/components/ui/neobrutal';

export function AccountSidebar() {
  const t = useTranslations('account.nav');
  const tDash = useTranslations('account.dashboard');
  const tLogout = useTranslations('account.logout');
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm(tLogout('confirm'))) {
      await logout();
      router.push('/masuk');
    }
  };

  const navLinks = [
    { key: 'dashboard', href: '/akun', icon: '👤' },
    { key: 'orders', href: '/akun/pesanan', icon: '📦' },
    { key: 'wishlist', href: '/akun/wishlist', icon: '❤️' },
    { key: 'profile', href: '/akun/profil', icon: '⚙️' },
  ] as const;

  return (
    <aside className="w-full md:w-64 shrink-0">
      <Card variant="surface" hoverable={false} className="p-5">
        <div className="pb-4 mb-4 border-b-2 border-ink">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/60">{t('customerAccount')}</p>
          <p className="text-lg font-black text-ink truncate mt-1">
            {user?.name || tDash('defaultCustomerName')}
          </p>
          <p className="text-xs font-mono text-ink/70 truncate">{user?.phone}</p>
        </div>

        <nav className="space-y-1">
          {navLinks.map((item) => {
            const isExact = pathname === item.href;
            const isChild = item.href !== '/akun' && pathname.startsWith(item.href);
            const active = isExact || isChild;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold border-2 transition-all ${
                  active
                    ? 'bg-primary text-white border-ink shadow-[2px_2px_0_0_var(--color-ink)]'
                    : 'border-transparent text-ink hover:bg-accent/40 hover:border-ink'
                }`}
              >
                <span>{item.icon}</span>
                <span>{t(item.key)}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 border-2 border-transparent hover:bg-red-50 hover:border-red-600 transition-all text-left mt-4"
          >
            <span>🚪</span>
            <span>{t('logout')}</span>
          </button>
        </nav>
      </Card>
    </aside>
  );
}
