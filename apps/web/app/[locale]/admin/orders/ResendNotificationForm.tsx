'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/admin/Button';
import { confirmDialog } from '@/components/ui/dialog-store';
import { toast } from '@/components/ui/toast-store';

import { resendOrder } from './[kodeOrder]/actions';

interface Props {
  kodeOrder: string;
}

const CHANNEL_LABEL: Record<'email' | 'wa' | 'all', 'resendEmail' | 'resendWhatsapp' | 'submitChannelAll'> = {
  email: 'resendEmail',
  wa: 'resendWhatsapp',
  all: 'submitChannelAll',
};

/**
 * 3 tombol (Email / WhatsApp / Semua) yang call server action resendOrder.
 * Pakai native form (no useActionState) — ringan, parallel-safe.
 */
export function ResendNotificationForm({ kodeOrder }: Props) {
  const t = useTranslations('admin.orders.actions');
  const [pending, startTransition] = useTransition();

  async function submit(channel: 'email' | 'wa' | 'all') {
    const channelLabel = t(CHANNEL_LABEL[channel]);
    const ok = await confirmDialog({
      title: t('resendConfirmTitle'),
      message: t('resendConfirmMessage', { channel: channelLabel }),
      confirmLabel: t('resendAll').replace('↻ ', ''),
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await resendOrder(kodeOrder, channel);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message ?? t('resendSuccess'));
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => submit('email')}
      >
        {pending ? '…' : t('resendEmail')}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => submit('wa')}
      >
        {pending ? '…' : t('resendWhatsapp')}
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        disabled={pending}
        onClick={() => submit('all')}
      >
        {pending ? '…' : t('resendAll')}
      </Button>
    </div>
  );
}