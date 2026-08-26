'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button } from '@/components/ui/neobrutal';
import { formatDate } from '@/lib/format';
import type { Order } from '@/lib/types';

interface Props {
  order: Order;
}

export function OrderHistoryItem({ order }: Props) {
  const t = useTranslations('account.orders');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-700';
      case 'preorder_deposit_paid':
        return 'bg-blue-100 text-blue-800 border-blue-700';
      case 'failed':
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-700';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border-purple-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-700';
    }
  };

  const statusKey = `status.${order.status}` as any;
  const statusLabel = t(statusKey);

  const itemCount = order.items?.length || 0;

  return (
    <Card variant="surface" hoverable={false} className="p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-ink">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-ink text-base">
              {order.kode_order}
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-bold uppercase border-2 ${getStatusBadge(
                order.status
              )}`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="text-xs text-ink/60 mt-0.5">
            {order.created_at ? formatDate(order.created_at) : '-'}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs text-ink/70 uppercase font-semibold">Total</p>
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
                <span className="font-mono text-ink/70">
                  {item.harga_saat_beli_formatted}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-ink/60">{itemCount} items</p>
        )}
      </div>

      <div className="pt-3 border-t-2 border-ink flex justify-end gap-2">
        <Button
          variant="primary"
          size="sm"
          href={
            order.status === 'pending'
              ? `/pembayaran/${order.kode_order}`
              : `/pesanan-sukses/${order.kode_order}`
          }
        >
          {t('viewDetail')}
        </Button>
      </div>
    </Card>
  );
}
