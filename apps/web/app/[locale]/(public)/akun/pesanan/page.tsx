'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/neobrutal';
import { CardMessage, EmptyState, PageIntro } from '@/components/ui';
import { OrderHistoryItem } from '@/components/customer/OrderHistoryItem';
import { authApi } from '@/lib/auth-api';
import type { Order } from '@/lib/types';

export default function AkunPesananPage() {
  const t = useTranslations('account.orders');
  const tAcc = useTranslations('account');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    async function loadOrders() {
      setLoading(true);
      try {
        const res = await authApi.getOrders(page);
        if (!mounted) return;
        setOrders(res.data || []);
        if (res.meta) {
          setLastPage(res.meta.last_page || 1);
        }
      } catch {
        if (!mounted) return;
        setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      mounted = false;
    };
  }, [page]);

  return (
    <div className="space-y-6">
      <PageIntro title={t('title')} subtitle={t('subtitle')} />

      {loading ? (
        <CardMessage size="lg" tone="bold">
          {tAcc('loadingOrders')}
        </CardMessage>
      ) : orders.length === 0 ? (
        <EmptyState
          compact
          size="lg"
          title={t('empty')}
          hint={t('emptyHint')}
          cta={{ href: '/katalog', label: t('startShopping') }}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderHistoryItem key={order.kode_order} order={order} />
          ))}

          {lastPage > 1 && (
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="surface"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t('prev')}
              </Button>
              <span className="text-xs font-mono font-bold text-ink">
                {t('pageInfo', { page, lastPage })}
              </span>
              <Button
                variant="surface"
                size="sm"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              >
                {t('next')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
