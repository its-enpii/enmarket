'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/admin/Button';
import { FormField } from '@/components/admin/FormField';
import { Card } from '@/components/ui/neobrutal';
import { FormError } from '@/components/ui/FormMessage';
import { Input } from '@/components/ui/Input';
import { SelectSearch } from '@/components/ui/SelectSearch';
import { toast } from '@/components/ui/toast-store';

import { insertLicenseKey, type ActionResult } from './actions';
import { useLicenseKey } from './LicenseKeyContext';

interface Props {
  products: Array<{ id: number; nama: string }>;
}

const INITIAL: ActionResult = {};

/**
 * License Key insert form. Split jadi 2 sub-components:
 *
 * - `<LicenseKeyTrigger>` — Button primary, dirender di `action` slot
 *   filter bar (sejajar dengan Reset). Tidak ada Card wrap.
 *
 * - `<LicenseKeyFormCard>` — Form Card lengkap, dirender di `secondary`
 *   slot di bawah filter bar. Hanya render saat open.
 *
 * State `open` di-share via `LicenseKeyProvider` context, jadi trigger
 * dan form konsisten walaupun rendered di tempat berbeda.
 *
 * Kalau products list panjang, dropdown di-virtualize di Fase 6.
 */
export function LicenseKeyTrigger({ products: _products }: Props) {
  const t = useTranslations('admin.licenseKeys');
  const { open, setOpen } = useLicenseKey();
  if (open) return null;
  return (
    <Button type="button" variant="primary" size="md" onClick={() => setOpen(true)}>
      {t('trigger')}
    </Button>
  );
}

export function LicenseKeyFormCard({ products }: Props) {
  const t = useTranslations('admin.licenseKeys.form');
  const { open, setOpen } = useLicenseKey();
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (prev, fd) => {
      const res = await insertLicenseKey(prev, fd);
      if (res.ok) {
        setOpen(false);
        if (res.message) toast.success(res.message);
      }
      return res;
    },
    INITIAL,
  );

  if (!open) return null;

  return (
    <Card variant="surface" className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b-2 border-ink pb-3">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
            {t('eyebrow')}
          </p>
          <h3 className="font-display text-xl font-black uppercase tracking-tight text-ink">
            {t('title')}
          </h3>
        </div>
        <Button type="button" variant="ghost" size="sm" flat onClick={() => setOpen(false)}>
          {t('close')}
        </Button>
      </div>

      <form action={formAction} className="space-y-3">
        <FormError variant="box">{state.error}</FormError>

        <SelectSearch
          name="product_id"
          label={t('fieldProduct')}
          required
          placeholder={t('productPlaceholder')}
          defaultValue=""
          showAllOption={{ value: '', label: t('productPlaceholder') }}
          options={products.map((p) => ({ value: String(p.id), label: p.nama }))}
          error={state.fieldErrors?.product_id?.[0]}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField label={t('fieldCount')} htmlFor="count" error={state.fieldErrors?.count?.[0]}>
            <Input
              id="count"
              name="count"
              type="number"
              min={1}
              max={500}
              defaultValue={10}
              required
            />
          </FormField>

          <FormField
            label={t('fieldPrefix')}
            htmlFor="prefix"
            error={state.fieldErrors?.prefix?.[0]}
            hint={t('fieldPrefixHint')}
          >
            <Input
              id="prefix"
              name="prefix"
              type="text"
              pattern="[A-Z0-9]{2,10}"
              maxLength={10}
              placeholder="ADMIN"
              className="uppercase font-mono"
            />
          </FormField>
        </div>

        <div className="flex gap-2 pt-2 border-t-2 border-ink">
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? t('submitPending') : t('submitGenerate')}
          </Button>
          <Button type="button" variant="ghost" size="md" flat onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
        </div>
      </form>
    </Card>
  );
}