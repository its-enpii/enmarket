'use client';

import { useTransition } from 'react';

import { Button } from '@/components/admin/Button';
import { confirmDialog } from '@/components/ui/dialog-store';
import { toast } from '@/components/ui/toast-store';

import { resendOrder } from './[kodeOrder]/actions';

interface Props {
  kodeOrder: string;
}

/**
 * 3 tombol (Email / WhatsApp / Semua) yang call server action resendOrder.
 * Pakai native form (no useActionState) — ringan, parallel-safe.
 */
export function ResendNotificationForm({ kodeOrder }: Props) {
  const [pending, startTransition] = useTransition();

  async function submit(channel: 'email' | 'wa' | 'all') {
    const ok = await confirmDialog({
      title: 'Kirim Ulang Notifikasi',
      message: `Kirim ulang notifikasi via ${channel}?`,
      confirmLabel: 'Kirim',
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await resendOrder(kodeOrder, channel);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message ?? 'Notifikasi terkirim.');
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
        {pending ? '…' : '📧 Resend Email'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => submit('wa')}
      >
        {pending ? '…' : '💬 Resend WhatsApp'}
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        disabled={pending}
        onClick={() => submit('all')}
      >
        {pending ? '…' : '↻ Resend Semua'}
      </Button>
    </div>
  );
}