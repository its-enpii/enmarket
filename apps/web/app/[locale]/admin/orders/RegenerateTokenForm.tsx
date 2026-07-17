'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/admin/Button';
import { confirmDialog } from '@/components/ui/dialog-store';
import { toast } from '@/components/ui/toast-store';

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
  const t = useTranslations('admin.orders.actions');
  const [pending, startTransition] = useTransition();

  async function handleClick() {
    const ok = await confirmDialog({
      title: t('regenerateTokenConfirmTitle'),
      message: t('regenerateTokenConfirmMessage'),
      confirmLabel: t('regenerateToken'),
      danger: true,
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await regenerateDownloadToken(kodeOrder, orderItemId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message ?? t('regenerateTokenSuccess'));
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
      {pending ? '…' : t('regenerateToken')}
    </Button>
  );
}