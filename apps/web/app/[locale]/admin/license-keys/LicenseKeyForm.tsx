'use client';

import { useActionState } from 'react';

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
  const { open, setOpen } = useLicenseKey();
  if (open) return null;
  return (
    <Button type="button" variant="primary" size="md" onClick={() => setOpen(true)}>
      + Tambah Key Manual
    </Button>
  );
}

export function LicenseKeyFormCard({ products }: Props) {
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
            ✎ Quick Action
          </p>
          <h3 className="font-display text-xl font-black uppercase tracking-tight text-ink">
            Tambah License Key Manual
          </h3>
        </div>
        <Button type="button" variant="ghost" size="sm" flat onClick={() => setOpen(false)}>
          ✕ Tutup
        </Button>
      </div>

      <form action={formAction} className="space-y-3">
        <FormError variant="box">{state.error}</FormError>

        <SelectSearch
          name="product_id"
          label="Produk"
          required
          placeholder="— Pilih produk —"
          defaultValue=""
          showAllOption={{ value: '', label: '— Pilih produk —' }}
          options={products.map((p) => ({ value: String(p.id), label: p.nama }))}
          error={state.fieldErrors?.product_id?.[0]}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Jumlah" htmlFor="count" error={state.fieldErrors?.count?.[0]}>
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
            label="Prefix (opsional)"
            htmlFor="prefix"
            error={state.fieldErrors?.prefix?.[0]}
            hint="Default: ADMIN. Huruf besar + angka, 2–10 char."
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
            {pending ? 'Menyimpan…' : 'Generate'}
          </Button>
          <Button type="button" variant="ghost" size="md" flat onClick={() => setOpen(false)}>
            Batal
          </Button>
        </div>
      </form>
    </Card>
  );
}