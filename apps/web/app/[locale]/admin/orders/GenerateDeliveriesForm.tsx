'use client';

import { useTransition } from 'react';

import { Button } from '@/components/admin/Button';
import { confirmDialog } from '@/components/ui/dialog-store';
import { toast } from '@/components/ui/toast-store';

import { generateOrderDeliveries } from './[kodeOrder]/actions';

interface Props {
  kodeOrder: string;
}

/**
 * Tombol re-trigger generateForOrder — untuk paid order yang belum punya delivery rows.
 */
export function GenerateDeliveriesForm({ kodeOrder }: Props) {
  const [pending, startTransition] = useTransition();

  async function handleClick() {
    const ok = await confirmDialog({
      title: 'Generate Ulang Deliveries',
      message: 'Generate ulang semua delivery untuk order ini?',
      confirmLabel: 'Generate',
      danger: true,
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await generateOrderDeliveries(kodeOrder);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message ?? 'Deliveries di-generate.');
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