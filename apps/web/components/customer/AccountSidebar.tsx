'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useAuth } from './AuthProvider';
import { Button, Card } from '@/components/ui/neobrutal';
import { confirmDialog } from '@/components/ui/dialog-store';
import { MetaLabel } from '@/components/ui';

export function AccountSidebar() {
  const t = useTranslations('account.nav');
  const tDash = useTranslations('account.dashboard');
  const tLogout = useTranslations('account.logout');
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const ok = await confirmDialog({
      title: tLogout('confirmTitle'),
      message: tLogout('confirm'),
      danger: true,
    });
    if (ok) {
      await logout();
      router.push('/masuk');
    }
  };

  const navLinks = [
    { key: 'dashboard', href: '/akun', icon: '👤' },
    { key: 'orders', href: '/akun/pesanan', icon: '📦' },
    { key: 'wishlist', href: '/akun/wishlist', icon: '❤️' },
    { key: 'profile', href: '/akun/profil', icon: '⚙️' },
    { key: 'topups', href: '/akun/topup', icon: '🎮' },
  ] as const;

  return (
    <aside className="w-full md:w-64 shrink-0">
      <Card variant="surface" hoverable={false} className="p-5">
        <div className="pb-4 mb-4 border-b-2 border-ink">
          <MetaLabel>{t('customerAccount')}</MetaLabel>
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
                ? 'bg-primary text-white border-ink shadow-brutal-2'
                : 'border-transparent text-ink hover:bg-accent/40 hover:border-ink'
            }`}
              >
                <span>{item.icon}</span>
                <span>{t(item.key)}</span>
              </Link>
            );
          })}

          <Button
            type="button"
            variant="surface"
            size="sm"
            tone="danger"
            fullWidth
            onClick={handleLogout}
            className="gap-3 mt-4 justify-start text-center"
          >
            <span>🚪</span>
            <span>{t('logout')}</span>
          </Button>
        </nav>
      </Card>
    </aside>
  );
}
