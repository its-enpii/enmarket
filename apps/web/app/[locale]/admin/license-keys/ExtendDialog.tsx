'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { confirmDialog } from '@/components/ui/dialog-store';
import { Input } from '@/components/ui/Input';
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
  const t = useTranslations('admin.licenseKeys.extend');
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState('30');
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(days);
    if (!Number.isFinite(n) || n < 1 || n > 365) {
      toast.error(t('invalidDays'));
      return;
    }
    const ok = await confirmDialog({
      title: t('confirmTitle'),
      message: t('confirmMessage', { days: n }),
      confirmLabel: t('confirmAction'),
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
        toast.success(res.message ?? t('success'));
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        {t('openButton')}
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-1 items-center">
      <Input
        type="number"
        variant="sm"
        min={1}
        max={365}
        value={days}
        onChange={(e) => setDays(e.target.value)}
        placeholder={t('daysPlaceholder')}
        autoFocus
        className="w-20"
      />
      <Button type="submit" variant="primary" size="sm" disabled={pending}>
        {pending ? '…' : t('okButton')}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
        ✕
      </Button>
    </form>
  );
}