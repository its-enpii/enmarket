'use client';

import { useTransition } from 'react';

import { Button } from '@/components/admin/Button';
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

  function submit(channel: 'email' | 'wa' | 'all') {
    if (!confirm(`Kirim ulang notifikasi via ${channel}?`)) return;
    startTransition(async () => {
      const res = await resendOrder(kodeOrder, channel);
      if (res.error) {
        alert(res.error);
      } else {
        alert(res.message ?? 'Notifikasi terkirim.');
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