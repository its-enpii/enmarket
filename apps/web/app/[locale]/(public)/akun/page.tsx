'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button } from '@/components/ui/neobrutal';
import { Badge } from '@/components/ui/Badge';
import { StatusPill } from '@/components/ui/StatusPill';
import { MetaLabel } from '@/components/ui';
import { useAuth } from '@/components/customer/AuthProvider';
import { OrderHistoryItem } from '@/components/customer/OrderHistoryItem';
import { authApi } from '@/lib/auth-api';
import type { Order } from '@/lib/types';

export default function AkunDashboardPage() {
  const t = useTranslations('account.dashboard');
  const tNav = useTranslations('account.nav');
  const tOrders = useTranslations('account.orders');
  const tAcc = useTranslations('account');
  const { user, isLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [ordersRes, wishlistRes] = await Promise.allSettled([
          authApi.getOrders(1),
          authApi.getWishlist(),
        ]);

        if (!mounted) return;

        if (ordersRes.status === 'fulfilled') {
          setOrders(ordersRes.value.data || []);
        }
        if (wishlistRes.status === 'fulfilled') {
          setWishlistCount(wishlistRes.value.count || 0);
        }
      } finally {
        if (mounted) setLoadingStats(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <Card variant="surface" hoverable={false} className="p-8 text-center">
        <p className="text-sm font-bold text-ink">{tAcc('loading')}</p>
      </Card>
    );
  }

  const name = user?.name || t('defaultCustomerName');

  return (
    <div className="space-y-6">
      <Card variant="surface" hoverable={false} className="p-6 md:p-8 bg-accent/10 border-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {t('title')}
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-ink mt-1">
          {t('welcomeGreeting', { name })}
        </h1>
        <p className="text-sm text-ink/70 mt-1">
          {t('subtitle')}
        </p>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="surface" hoverable={false} className="p-5">
          <MetaLabel>{t('totalOrders')}</MetaLabel>
          <p className="text-3xl font-black font-mono text-ink mt-2">
            {loadingStats ? '-' : orders.length}
          </p>
          <div className="mt-3">
            <Button variant="primary" size="sm" href="/akun/pesanan">
              {t('viewAllOrders')}
            </Button>
          </div>
        </Card>

        <Card variant="surface" hoverable={false} className="p-5">
          <MetaLabel>{tNav('wishlist')}</MetaLabel>
          <p className="text-3xl font-black font-mono text-ink mt-2">
            {loadingStats ? '-' : wishlistCount}
          </p>
          <div className="mt-3">
            <Button variant="primary" size="sm" href="/akun/wishlist">
              {t('openWishlist')}
            </Button>
          </div>
        </Card>

        <Card variant="surface" hoverable={false} className="p-5">
          <MetaLabel>{t('verificationStatus')}</MetaLabel>
          <div className="mt-2">
            <StatusPill tone="success" className="text-xs">
            <span>✓</span> {t('verifiedWA')}
            </StatusPill>
          </div>
          <p className="text-xs font-mono text-ink/60 mt-2 truncate">
            {user?.phone}
          </p>
        </Card>
      </div>

      {/* Recent Orders Preview */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase text-ink tracking-tight">
            {tOrders('title')}
          </h2>
          {orders.length > 0 && (
            <Button variant="surface" size="sm" href="/akun/pesanan">
              {t('viewAll')}
            </Button>
          )}
        </div>

        {loadingStats ? (
          <p className="text-sm text-ink/70">{tAcc('loadingOrders')}</p>
        ) : orders.length === 0 ? (
          <Card variant="surface" hoverable={false} className="p-8 text-center">
            <p className="text-sm font-semibold text-ink/70 mb-4">{tOrders('empty')}</p>
            <Button variant="primary" size="md" href="/katalog">
              {t('exploreCatalog')}
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <OrderHistoryItem key={order.kode_order} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
