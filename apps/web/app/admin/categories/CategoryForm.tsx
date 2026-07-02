/**
 * Reusable form untuk create/edit kategori.
 * Pakai useActionState agar error dari server action muncul.
 */

'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/admin/Button';
import { FormField } from '@/components/admin/FormField';
import { slugify } from '@/lib/format';

import { createCategory, updateCategory, ActionResult } from './actions';

interface CategoryForEdit {
  id: number;
  nama: string;
  slug: string;
  deskripsi: string | null;
}

interface Props {
  initial?: CategoryForEdit;
}

export function CategoryForm({ initial }: Props) {
  const router = useRouter();
  const isEdit = !!initial;

  const action = isEdit
    ? updateCategory.bind(null, initial!.id)
    : createCategory;

  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, fd: FormData): Promise<ActionResult> => {
      if (isEdit) {
        return await updateCategory(initial!.id, _prev, fd);
      }
      return await createCategory(_prev, fd);
    },
    {} as ActionResult,
  );

  function autoSlug(e: React.FocusEvent<HTMLInputElement>) {
    if (isEdit) return; // jangan override saat edit
    const slugInput = document.getElementById('slug') as HTMLInputElement | null;
    if (slugInput && !slugInput.value) {
      slugInput.value = slugify(e.target.value);
    }
  }

  const fieldErr = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Nama" htmlFor="nama" required error={fieldErr('nama')}>
        <input
          id="nama"
          name="nama"
          required
          defaultValue={initial?.nama}
          onBlur={autoSlug}
          className="w-full bg-surface border-2 border-ink px-3 py-2 text-ink focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
        />
      </FormField>

      <FormField
        label="Slug"
        htmlFor="slug"
        hint="Otomatis dari nama (editable). Hanya huruf kecil, angka, dan strip."
        error={fieldErr('slug')}
      >
        <input
          id="slug"
          name="slug"
          defaultValue={initial?.slug ?? ''}
          pattern="[a-z0-9-]+"
          className="w-full bg-surface border-2 border-ink px-3 py-2 text-ink font-mono text-sm focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
        />
      </FormField>

      <FormField
        label="Deskripsi"
        htmlFor="deskripsi"
        hint="Opsional. Maks 1000 karakter."
        error={fieldErr('deskripsi')}
      >
        <textarea
          id="deskripsi"
          name="deskripsi"
          rows={4}
          defaultValue={initial?.deskripsi ?? ''}
          className="w-full bg-surface border-2 border-ink px-3 py-2 text-ink focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all resize-y"
        />
      </FormField>

      {state.error && (
        <div className="bg-accent border-2 border-ink px-4 py-2 text-sm font-bold text-ink shadow-[2px_2px_0_0_var(--color-ink)]">
          {state.error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Kategori'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/categories')}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}