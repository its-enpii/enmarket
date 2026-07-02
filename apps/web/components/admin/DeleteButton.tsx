'use client';

/**
 * Delete button dengan confirm dialog. Pakai Server Action atau function
 * custom yang dipassing dari parent (action dengan formData berisi id).
 */

import { useTransition } from 'react';

interface Props {
  action: (formData: FormData) => Promise<void>;
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
  className = '',
}: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const msg = confirmMessage ?? `Hapus${itemName ? ` "${itemName}"` : ''}? Tindakan ini tidak bisa dibatalkan.`;
    if (!confirm(msg)) return;

    const fd = new FormData();
    fd.append('id', String(itemId));
    startTransition(() => {
      action(fd);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={
        'border-2 border-ink font-bold px-3 py-1.5 text-sm ' +
        'bg-accent text-ink shadow-[2px_2px_0_0_var(--color-ink)] ' +
        'hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--color-ink)] ' +
        'active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--color-ink)] ' +
        'transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ' +
        className
      }
    >
      {pending ? '…' : 'Hapus'}
    </button>
  );
}
