'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card } from '@/components/ui/neobrutal';
import { formatDate } from '@/lib/format';
import { ORDER_STATUS_COLORS } from '@/lib/status';
import type { Order } from '@/lib/types';

interface Props {
  order: Order;
}

export function OrderHistoryItem({ order }: Props) {
  const t = useTranslations('account.orders');

  const statusColor = ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.expired;
  const statusLabel = t(`status.${order.status}` as any) || order.status;

  return (
    <Card variant="surface" hoverable={false} className="p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-ink gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-black text-ink text-sm sm:text-base">
              #{order.kode_order}
            </span>
            <span
              className={`text-fine font-bold px-2 py-0.5 border-2 uppercase tracking-wide ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="text-xs text-ink/60 mt-0.5">
            {order.created_at ? formatDate(order.created_at) : '-'}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs text-ink/70 uppercase font-semibold">{t('totalLabel')}</p>
          <p className="font-black text-ink text-lg font-mono">
            {order.total_harga_formatted}
          </p>
        </div>
      </div>

      <div className="py-3">
        {order.items && order.items.length > 0 ? (
          <ul className="space-y-1 text-sm text-ink">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-medium truncate max-w-[70%]">
                  • {item.nama_produk}
                </span>
                <span className="font-mono text-ink/80 text-xs">
                  {item.harga_saat_beli_formatted}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-ink/50 italic">-</p>
        )}
      </div>

      <div className="pt-3 border-t-2 border-ink flex justify-end gap-2">
        <Button
          variant="primary"
          size="sm"
          href={`/cek-pesanan/${order.kode_order}`}
        >
          {t('viewDetail')}
        </Button>
      </div>
    </Card>
  );
}
