'use client';

/**
 * Delete button dengan confirm dialog. Pakai Server Action atau function
 * custom yang dipassing dari parent (action dengan formData berisi id).
 */

import { useTransition } from 'react';

import { Button } from '@/components/ui/neobrutal';
import { confirmDialog } from '@/components/ui/dialog-store';
import { toast } from '@/components/ui/toast-store';

interface Props {
  action: (formData: FormData) => Promise<{ error?: string; ok?: boolean; message?: string } | void>;
  confirmMessage?: string;
  itemId: number | string;
  itemName?: string;
  className?: string;
}

export function DeleteButton({
  action,
  confirmMessage,
  itemId,
  itemName,
  className,
}: Props) {
  const [pending, startTransition] = useTransition();

  async function handleClick() {
    const msg = confirmMessage ?? `Hapus${itemName ? ` "${itemName}"` : ''}? Tindakan ini tidak bisa dibatalkan.`;
    const ok = await confirmDialog({
      title: 'Konfirmasi Hapus',
      message: msg,
      confirmLabel: 'Hapus',
      danger: true,
    });
    if (!ok) return;

    const fd = new FormData();
    fd.append('id', String(itemId));
    startTransition(async () => {
      const res = await action(fd);
      if (res && 'error' in res && res.error) {
        toast.error(res.error);
      } else if (res && 'message' in res && res.message) {
        toast.success(res.message);
      } else {
        toast.success('Berhasil dihapus.');
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
      className={className}
    >
      {pending ? '…' : 'Hapus'}
    </Button>
  );
}
