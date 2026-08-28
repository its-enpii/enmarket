'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/neobrutal';
import { formatRupiah, formatDate } from '@/lib/format';
import type { TopupOrder, TopupStatus } from '@/lib/types';

const STATUS_COLORS: Record<TopupStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-600',
  processing: 'bg-blue-100 text-blue-800 border-blue-600',
  success: 'bg-green-100 text-green-800 border-green-600',
  failed: 'bg-red-100 text-red-800 border-red-600',
};

interface Props {
  order: TopupOrder;
}

export function TopupHistoryItem({ order }: Props) {
  const t = useTranslations('account.topups');
  const status = order.topup_status ?? 'pending';
  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.pending;

  return (
    <Card variant="surface" hoverable={false} className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-ink truncate">
            {order.game?.nama ?? 'Game'} — {order.game_item?.nama ?? 'Item'}
          </p>
          <p className="text-xs text-ink/60 mt-1">
            {order.kode_order} · {formatDate(order.created_at)}
          </p>
          {order.digiflazz_trx_id && (
            <p className="text-xs text-ink/50 mt-1 font-mono">SN: {order.digiflazz_trx_id}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-sm">{formatRupiah(order.total_harga)}</p>
          <span className={`inline-block text-xs font-bold px-2 py-0.5 border-2 mt-1 ${statusColor}`}>
            {t(`status.${status}`)}
          </span>
        </div>
      </div>
    </Card>
  );
}
