'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/admin/Button';
import { confirmDialog } from '@/components/ui/dialog-store';
import { toast } from '@/components/ui/toast-store';

import { extendLicenseKey } from './actions';

interface Props {
  id: number;
}

/**
 * Inline toggle form: tombol "Perpanjang" → expand form input days → submit.
 * Pattern simpel, no modal infra.
 */
export function ExtendDialog({ id }: Props) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState('30');
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(days);
    if (!Number.isFinite(n) || n < 1 || n > 365) {
      toast.error('Hari harus antara 1–365.');
      return;
    }
    const ok = await confirmDialog({
      title: 'Perpanjang Expired',
      message: `Perpanjang expired_at ${n} hari?`,
      confirmLabel: 'Perpanjang',
    });
    if (!ok) return;

    const fd = new FormData();
    fd.append('id', String(id));
    fd.append('days', String(n));

    startTransition(async () => {
      const res = await extendLicenseKey(fd);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message ?? 'Expired diperpanjang.');
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Perpanjang
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-1 items-center">
      <input
        type="number"
        min={1}
        max={365}
        value={days}
        onChange={(e) => setDays(e.target.value)}
        className="w-20 bg-surface border-2 border-ink px-2 py-1 text-sm"
        placeholder="hari"
        autoFocus
      />
      <Button type="submit" variant="primary" size="sm" disabled={pending}>
        {pending ? '…' : 'OK'}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
        ✕
      </Button>
    </form>
  );
}