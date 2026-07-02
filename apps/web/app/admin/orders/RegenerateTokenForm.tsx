'use client';

import { useTransition } from 'react';

import { Button } from '@/components/admin/Button';
import { regenerateDownloadToken } from './[kodeOrder]/actions';

interface Props {
  kodeOrder: string;
  orderItemId: number;
}

/**
 * Tombol per-delivery: confirm → regenerate token + extend 7 hari + re-email.
 * Setelah sukses, revalidatePath di server action refresh halaman.
 */
export function RegenerateTokenForm({ kodeOrder, orderItemId }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm('Generate token download baru? Token lama akan tidak valid lagi.')) return;
    startTransition(async () => {
      const res = await regenerateDownloadToken(kodeOrder, orderItemId);
      if (res.error) {
        alert(res.error);
      } else {
        alert(res.message ?? 'Token baru telah dibuat.');
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
      {pending ? '…' : '↻ Token Baru'}
    </Button>
  );
}