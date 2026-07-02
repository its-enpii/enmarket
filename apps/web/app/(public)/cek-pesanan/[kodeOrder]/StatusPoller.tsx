'use client';

import { useEffect, useState } from 'react';

import type { OrderStatus, OrderStatusSummary } from '@/lib/types';

interface Props {
  kodeOrder: string;
  initialStatus: OrderStatus;
}

/**
 * Lightweight status polling — refresh setiap 10 detik kalau masih pending.
 * Pakai raw fetch (bukan @/lib/api) karena endpoint ini tidak butuh cookie.
 */
export function StatusPoller({ kodeOrder, initialStatus }: Props) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);

  useEffect(() => {
    if (status !== 'pending') return;

    const interval = setInterval(async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/orders/${kodeOrder}/status`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const json = (await res.json()) as { data: OrderStatusSummary };
        if (json.data.status !== status) {
          setStatus(json.data.status);
          window.location.reload();
        }
      } catch (err) {
        console.warn('StatusPoller error:', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [kodeOrder, status]);

  return null;
}