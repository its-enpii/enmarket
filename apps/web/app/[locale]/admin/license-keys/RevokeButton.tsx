'use client';

import { useTransition } from 'react';

import { Button } from '@/components/ui/neobrutal';
import { confirmDialog } from '@/components/ui/dialog-store';
import { toast } from '@/components/ui/toast-store';

import { revokeLicenseKey } from './actions';

interface Props {
  id: number;
  keyMasked: string;
}

export function RevokeButton({ id, keyMasked }: Props) {
  const [pending, startTransition] = useTransition();

  async function handleClick() {
    const ok = await confirmDialog({
      title: 'Cabut License Key',
      message: `Cabut license key "${keyMasked}"? Tindakan ini tidak bisa dibatalkan.`,
      confirmLabel: 'Cabut',
      danger: true,
    });
    if (!ok) return;

    const fd = new FormData();
    fd.append('id', String(id));
    startTransition(async () => {
      const res = await revokeLicenseKey(fd);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message ?? 'Key dicabut.');
      }
    });
  }

  return (
    <Button
      variant="accent"
      size="sm"
      type="button"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? '…' : 'Cabut'}
    </Button>
  );
}
