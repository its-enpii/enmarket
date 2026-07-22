'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { confirmDialog } from '@/components/ui/dialog-store';
import { toast } from '@/components/ui/toast-store';

import { releasePreorderNow } from './actions';

interface Props {
  kodeOrder: string;
}

/**
 * Tombol "Release Now" — konfirmasi dulu lalu trigger server action.
 * Pakai useTransition untuk pending state tanpa form action overhead.
 */
export function ReleaseNowForm({ kodeOrder }: Props) {
  const t = useTranslations('admin.preorders');
  const [pending, startTransition] = useTransition();

  async function submit() {
    const ok = await confirmDialog({
      title: t('releaseConfirmTitle'),
      message: t('releaseConfirmMessage', { kode: kodeOrder }),
      confirmLabel: t('actionReleaseNow').replace('↗ ', ''),
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await releasePreorderNow(kodeOrder);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message ?? t('releaseSuccess'));
      }
    });
  }

  return (
    <Button
      type="button"
      variant="primary"
      size="sm"
      disabled={pending}
      onClick={submit}
    >
      {pending ? '…' : t('actionReleaseNow')}
    </Button>
  );
}