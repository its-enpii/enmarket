/**
 * Reusable form untuk create/edit kategori.
 * Pakai useActionState agar error dari server action muncul.
 */

'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AlertBanner } from '@/components/ui/AlertBanner';
import { FormFooter } from '@/components/ui';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { slugify } from '@/lib/format';
import { toast } from '@/components/ui/toast-store';

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
  const t = useTranslations('admin.categories.form');
  const tBtns = useTranslations('common.buttons');
  const isEdit = !!initial;

  // Controlled state — React 19 + Next 15 me-reset uncontrolled <input>
  // setelah form action selesai (sukses maupun gagal). Semua field pakai
  // useState + value supaya isian admin tidak hilang saat validasi gagal.
  const [nama, setNama] = useState(initial?.nama ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [deskripsi, setDeskripsi] = useState(initial?.deskripsi ?? '');

  const actionFn = isEdit ? updateCategory.bind(null, initial!.id) : createCategory;
  const [state, formAction, pending] = useActionState(actionFn, {} as ActionResult);

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message, 3000);
      if (state.redirectTo) {
        router.push(state.redirectTo);
      }
    }
  }, [state, router]);

  function autoSlug(e: React.FocusEvent<HTMLInputElement>) {
    if (isEdit) return; // jangan override saat edit
    if (!slug) {
      setSlug(slugify(e.target.value));
    }
  }

  const fieldErr = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <form action={formAction} className="space-y-5">
      <FormField label={t('fieldName')} htmlFor="nama" required error={fieldErr('nama')}>
        <Input
          id="nama"
          name="nama"
          required
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          onBlur={autoSlug}
        />
      </FormField>

      <FormField
        label={t('fieldSlug')}
        htmlFor="slug"
        hint={t('fieldSlugHint')}
        error={fieldErr('slug')}
      >
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          pattern="[a-z0-9-]+"
          className="font-mono"
        />
      </FormField>

      <FormField
        label={t('fieldDescription')}
        htmlFor="deskripsi"
        hint={t('fieldDescriptionHint')}
        error={fieldErr('deskripsi')}
      >
        <Textarea
          id="deskripsi"
          name="deskripsi"
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
        />
      </FormField>

      {state.error && (
        <AlertBanner variant="error">
          {state.error}
        </AlertBanner>
      )}

      <FormFooter
        pending={pending}
        submitLabel={pending ? t('submitPending') : isEdit ? t('submitSave') : t('submitCreate')}
        cancelHref="/admin/categories"
        cancelLabel={tBtns('cancel')}
      />
    </form>
  );
}
