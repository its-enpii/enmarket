'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/neobrutal';
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
        <Card variant="surface" hoverable={false} className="p-8 text-center">
          <p className="text-ink/60 animate-pulse">Loading...</p>
        </Card>
      ) : orders.length === 0 ? (
        <Card variant="surface" hoverable={false} className="p-8 text-center">
          <p className="text-ink/60">{t('empty')}</p>
        </Card>
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
