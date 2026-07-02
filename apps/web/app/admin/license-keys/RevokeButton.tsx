'use client';

import { useTransition } from 'react';

import { revokeLicenseKey } from './actions';

interface Props {
  id: number;
  keyMasked: string; // untuk confirm message
}

/**
 * Konfirmasi + revoke. Pakai DeleteButton pattern (startTransition + formData).
 */
export function RevokeButton({ id, keyMasked }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Cabut license key "${keyMasked}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    const fd = new FormData();
    fd.append('id', String(id));
    startTransition(async () => {
      const res = await revokeLicenseKey(fd);
      if (res.error) {
        alert(res.error);
      } else {
        alert(res.message ?? 'Key dicabut.');
      }
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
        'transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
      }
    >
      {pending ? '…' : 'Cabut'}
    </button>
  );
}