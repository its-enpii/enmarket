'use client';

import { useTransition } from 'react';

import { Button } from '@/components/admin/Button';
import { generateOrderDeliveries } from './[kodeOrder]/actions';

interface Props {
  kodeOrder: string;
}

/**
 * Tombol re-trigger generateForOrder — untuk paid order yang belum punya delivery rows.
 */
export function GenerateDeliveriesForm({ kodeOrder }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm('Generate ulang semua delivery untuk order ini?')) return;
    startTransition(async () => {
      const res = await generateOrderDeliveries(kodeOrder);
      if (res.error) {
        alert(res.error);
      } else {
        alert(res.message ?? 'Deliveries di-generate.');
      }
    });
  }

  return (
    <Button
      type="button"
      variant="accent"
      size="sm"
      disabled={pending}
      onClick={handleClick}
    >
      {pending ? '…' : '⚙ Generate Deliveries'}
    </Button>
  );
}