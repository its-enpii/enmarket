'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
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
  const t = useTranslations('admin.orders.actions');
  const [pending, startTransition] = useTransition();

  async function handleClick() {
    const ok = await confirmDialog({
      title: t('generateDeliveriesConfirmTitle'),
      message: t('generateDeliveriesConfirmMessage'),
      confirmLabel: t('generateDeliveries'),
      danger: true,
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await generateOrderDeliveries(kodeOrder);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message ?? t('generateDeliveriesSuccess'));
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
      {pending ? '…' : t('generateDeliveries')}
    </Button>
  );
}