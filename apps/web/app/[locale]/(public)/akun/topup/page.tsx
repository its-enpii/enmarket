'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { CardMessage } from '@/components/ui';
import { TopupHistoryItem } from '@/components/customer/TopupHistoryItem';
import { topupApi } from '@/lib/topup-api';
import type { TopupOrder } from '@/lib/types';

export default function TopupHistoryPage() {
  const t = useTranslations('account.topups');
  const [orders, setOrders] = useState<TopupOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await topupApi.getTopupHistory();
        if (mounted) setOrders(res.data ?? []);
      } catch {
        // silent
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-black text-ink mb-6">{t('title')}</h1>

      {loading ? (
        <CardMessage size="sm" tone="muted" pulse>
          Loading...
        </CardMessage>
      ) : orders.length === 0 ? (
        <CardMessage size="sm" tone="muted">{t('empty')}</CardMessage>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <TopupHistoryItem key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
