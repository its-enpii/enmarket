/**
 * Reusable form untuk create/edit produk.
 */

'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { FileUpload } from '@/components/admin/FileUpload';
import { FormField } from '@/components/admin/FormField';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { SelectSearch } from '@/components/ui/SelectSearch';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/neobrutal';
import { slugify } from '@/lib/format';
import type { Category, Product } from '@/lib/types';

import { createProduct, updateProduct, ActionResult } from './actions';

interface Props {
  categories: Category[];
  initial?: Product;
}

/**
 * Sub-section header — border-b-2 + label kecil + h2 medium.
 * Konsisten dengan style halaman settings/dashboard.
 */
function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="border-b-2 border-ink pb-3">
      <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
        ✎ {eyebrow}
      </p>
      <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">
        {title}
      </h2>
    </div>
  );
}

export function ProductForm({ categories, initial }: Props) {
  const router = useRouter();
  const t = useTranslations('admin.products.form');
  const tBtns = useTranslations('common.buttons');
  const isEdit = !!initial;

  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, fd: FormData): Promise<ActionResult> => {
      if (isEdit) {
        return await updateProduct(initial!.id, _prev, fd);
      }
      return await createProduct(_prev, fd);
    },
    {} as ActionResult,
  );

  const [fitur, setFitur] = useState<string[]>(initial?.fitur ?? []);
  const [newFitur, setNewFitur] = useState('');

  function autoSlug(e: React.FocusEvent<HTMLInputElement>) {
    if (isEdit) return;
    const el = document.getElementById('slug') as HTMLInputElement | null;
    if (el && !el.value) el.value = slugify(e.target.value);
  }

  function addFitur() {
    const v = newFitur.trim();
    if (!v) return;
    setFitur([...fitur, v]);
    setNewFitur('');
  }

  function removeFitur(i: number) {
    setFitur(fitur.filter((_, idx) => idx !== i));
  }

  const fieldErr = (k: string) => state.fieldErrors?.[k]?.[0];

  // Serialize fitur as JSON for the hidden input
  const fiturJson = JSON.stringify(fitur);

  return (
    <form action={formAction} className="space-y-8">
      {/* ───── Identitas ───── */}
      <section className="space-y-5">
        <SectionHeader eyebrow={t('sectionIdentity')} title={t('sectionIdentityTitle')} />
        <div className="grid md:grid-cols-2 gap-5">
          <FormField label={t('fieldName')} htmlFor="nama" required error={fieldErr('nama')}>
            <Input
              id="nama"
              name="nama"
              required
              maxLength={200}
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

          <FormField label={t('fieldCategory')} htmlFor="category_id" error={fieldErr('category_id')}>
            <SelectSearch
              name="category_id"
              options={categories.map((c) => ({
                value: String(c.id),
                label: c.nama,
                hint: c.slug ?? undefined,
              }))}
              defaultValue={initial?.category_id ? String(initial.category_id) : ''}
              placeholder={t('categoryPlaceholder')}
              clearable
              showAllOption={{ value: '', label: t('categoryPlaceholder') }}
            />
          </FormField>
        </div>
      </section>

      {/* ───── Harga & Tipe ───── */}
      <section className="space-y-5">
        <SectionHeader eyebrow={t('sectionPricing')} title={t('sectionPricingTitle')} />
        <div className="grid md:grid-cols-2 gap-5">
          <FormField label={t('fieldPrice')} htmlFor="harga" required error={fieldErr('harga')}>
            <Input
              id="harga"
              name="harga"
              type="number"
              min="0"
              step="1000"
              required
              defaultValue={initial?.harga ?? ''}
            />
          </FormField>

          <FormField label={t('fieldType')} htmlFor="tipe" required error={fieldErr('tipe')}>
            <SelectSearch
              name="tipe"
              required
              defaultValue={initial?.tipe ?? 'download'}
              placeholder={t('typePlaceholder')}
              options={[
                { value: 'download', label: t('typeDownload') },
                { value: 'license', label: t('typeLicense') },
                { value: 'bundle', label: t('typeBundle') },
              ]}
            />
          </FormField>

          <FormField label={t('fieldStatus')} htmlFor="status" required error={fieldErr('status')}>
            <SelectSearch
              name="status"
              required
              defaultValue={initial?.status ?? 'draft'}
              placeholder={t('statusPlaceholder')}
              options={[
                { value: 'draft', label: t('statusDraft') },
                { value: 'aktif', label: t('statusActive') },
                { value: 'tidak_dijual', label: t('statusNotForSale') },
              ]}
            />
          </FormField>

          <FormField
            label={t('fieldDownloadExpiry')}
            htmlFor="download_expiry_days"
            hint={t('fieldDownloadExpiryHint')}
            error={fieldErr('download_expiry_days')}
          >
            <Input
              id="download_expiry_days"
              name="download_expiry_days"
              type="number"
              min="1"
              max="365"
              defaultValue={initial?.download_expiry_days ?? 7}
            />
          </FormField>
        </div>
      </section>

      {/* ───── Deskripsi ───── */}
      <section className="space-y-5">
        <SectionHeader eyebrow={t('sectionContent')} title={t('sectionContentTitle')} />
        <FormField label={t('fieldDescription')} htmlFor="deskripsi" required error={fieldErr('deskripsi')}>
          <Textarea
            id="deskripsi"
            name="deskripsi"
            rows={5}
            required
            defaultValue={initial?.deskripsi ?? ''}
          />
        </FormField>

        <FormField label={t('fieldFitur')} htmlFor="fitur-input" hint={t('fieldFiturHint')} error={fieldErr('fitur')}>
          <input type="hidden" name="fitur" value={fiturJson} />
          <div className="space-y-2">
            {fitur.map((f, i) => (
              <Card
                key={i}
                variant="surface"
                hoverable={false}
                className="flex items-center gap-2 px-3 py-2"
              >
                <span className="text-primary font-bold">{i + 1}.</span>
                <span className="flex-1 text-sm">{f}</span>
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  flat
                  onClick={() => removeFitur(i)}
                  srLabel={t('fiturRemove', { value: f })}
                >
                  ×
                </Button>
              </Card>
            ))}
            <div className="flex gap-2">
              <Input
                value={newFitur}
                onChange={(e) => setNewFitur(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFitur();
                  }
                }}
                placeholder={t('fiturPlaceholder')}
                className="flex-1"
                variant="flat"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                flat
                onClick={addFitur}
                srLabel={t('fiturAdd')}
              >
                +
              </Button>
            </div>
          </div>
        </FormField>
      </section>

      {/* ───── File produk ───── */}
      <section className="space-y-5">
        <SectionHeader eyebrow={t('sectionFile')} title={t('sectionFileTitle')} />
        <FormField
          label={t('fieldFile')}
          htmlFor="file"
          hint={
            isEdit && initial?.file_url
              ? t('fieldFileHintCurrent', { url: initial.file_url })
              : t('fieldFileHintEmpty')
          }
          error={fieldErr('file')}
        >
          <FileUpload name="file" accept=".zip,.rar,.7z,.pdf,.apk,.exe,.tar.gz" maxSizeMB={500} />
          {isEdit && initial?.file_url && (
            <Checkbox name="remove_file" value="1" label={t('removeFile')} className="mt-2" />
          )}
        </FormField>
      </section>

      {state.error && (
        <Card variant="filled-accent" hoverable={false} className="px-4 py-2 text-sm font-bold">
          {state.error}
        </Card>
      )}

      <div className="flex gap-3 pt-2 border-t-2 border-ink">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? t('submitPending') : isEdit ? t('submitSave') : t('submitCreate')}
        </Button>
        <Button type="button" variant="ghost" size="md" flat onClick={() => router.back()}>
          {tBtns('cancel')}
        </Button>
      </div>
    </form>
  );
}