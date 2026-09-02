'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/neobrutal';
import { Text } from '@/components/ui';
import { formatRupiah, formatDate } from '@/lib/format';
import type { TopupOrder, TopupStatus } from '@/lib/types';

const STATUS_TONE: Record<TopupStatus, BadgeTone> = {
  pending: 'surface',
  processing: 'primary',
  success: 'accent',
  failed: 'ink',
};

interface Props {
  order: TopupOrder;
}

export function TopupHistoryItem({ order }: Props) {
  const t = useTranslations('account.topups');
  const status = order.topup_status ?? 'pending';
  const tone = STATUS_TONE[status] ?? STATUS_TONE.pending;

  return (
    <Card variant="surface" hoverable={false} className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-ink truncate">
            {order.game?.nama ?? 'Game'} — {order.game_item?.nama ?? 'Item'}
          </p>
          <Text className="mt-1">
            {order.kode_order} · {formatDate(order.created_at)}
          </Text>
          {order.digiflazz_trx_id && (
            <p className="text-xs text-ink/50 mt-1 font-mono">SN: {order.digiflazz_trx_id}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-sm">{formatRupiah(order.total_harga)}</p>
          <div className="mt-1">
            <Badge tone={tone} size="sm">
              {t(`status.${status}`)}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
