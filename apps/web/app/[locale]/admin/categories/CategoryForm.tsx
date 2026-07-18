/**
 * Reusable form untuk create/edit kategori.
 * Pakai useActionState agar error dari server action muncul.
 */

'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/neobrutal';
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
  const t = useTranslations('admin.categories.form');
  const tBtns = useTranslations('common.buttons');
  const isEdit = !!initial;

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
      <FormField label={t('fieldName')} htmlFor="nama" required error={fieldErr('nama')}>
        <Input
          id="nama"
          name="nama"
          required
          defaultValue={initial?.nama}
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
          defaultValue={initial?.slug ?? ''}
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
          defaultValue={initial?.deskripsi ?? ''}
        />
      </FormField>

      {state.error && (
        <Card variant="filled-accent" hoverable={false} className="px-4 py-2 text-sm font-bold">
          {state.error}
        </Card>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? t('submitPending') : isEdit ? t('submitSave') : t('submitCreate')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="md"
          flat
          onClick={() => router.push('/admin/categories')}
        >
          {tBtns('cancel')}
        </Button>
      </div>
    </form>
  );
}