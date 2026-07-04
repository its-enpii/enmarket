'use client';

import { useActionState, useState } from 'react';

import { Button } from '@/components/admin/Button';
import { FormField } from '@/components/admin/FormField';
import { FormError } from '@/components/ui/FormMessage';
import { Input } from '@/components/ui/Input';
import { SelectSearch } from '@/components/ui/SelectSearch';
import { toast } from '@/components/ui/toast-store';

import { insertLicenseKey, type ActionResult } from './actions';

interface Props {
  products: Array<{ id: number; nama: string }>;
}

const INITIAL: ActionResult = {};

/**
 * Form insert manual license key. Toggle on/off (inline) — tidak butuh route baru.
 * Kalau products list panjang, dropdown di-virtualize di Fase 6.
 */
export function LicenseKeyForm({ products }: Props) {
  const [open, setOpen] = useState(false);
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

  if (!open) {
    return (
      <Button type="button" variant="primary" onClick={() => setOpen(true)}>
        + Tambah Key Manual
      </Button>
    );
  }

  return (
    <div className="bg-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Tambah License Key Manual</h3>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
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

        <div className="flex gap-2 pt-2">
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? 'Menyimpan…' : 'Generate'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}