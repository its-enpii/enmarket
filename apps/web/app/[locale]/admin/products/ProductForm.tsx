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
import type { Category, LinkedPost, Product } from '@/lib/types';

import { createProduct, updateProduct, ActionResult } from './actions';
import { DatePicker } from '@/components/ui/DatePicker';

interface Props {
  categories: Category[];
  initial?: Product;
  /** Post published yang tersedia untuk di-link — di-load server-side. */
  availablePosts?: LinkedPost[];
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

export function ProductForm({ categories, initial, availablePosts = [] }: Props) {
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
  // Linked posts — array of post_id yang dipilih admin. Urutan = index array.
  const [linkedIds, setLinkedIds] = useState<number[]>(
    (initial?.linked_posts ?? []).map((p) => p.id),
  );

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

  function toggleLinked(id: number) {
    setLinkedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function moveLinked(id: number, dir: -1 | 1) {
    setLinkedIds((prev) => {
      const idx = prev.indexOf(id);
      const newIdx = idx + dir;
      if (idx === -1 || newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }

  function removeLinked(id: number) {
    setLinkedIds((prev) => prev.filter((x) => x !== id));
  }

  const fieldErr = (k: string) => state.fieldErrors?.[k]?.[0];

  // Serialize fitur as JSON for the hidden input
  const fiturJson = JSON.stringify(fitur);

  // Hidden inputs: satu `<input name="linked_posts">` per post_id, urutan
  // sesuai array (admin atur via tombol ↑↓). Empty array → sync detach semua.
  const linkedById = new Map(availablePosts.map((p) => [p.id, p]));

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
                { value: 'account_manual', label: t('typeAccountManual') },
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

      {/* ───── Pre-Order ───── */}
      <section className="space-y-5">
        <SectionHeader eyebrow={t('sectionPreOrder')} title={t('sectionPreOrderTitle')} />
        <FormField
          label={t('fieldPreOrder')}
          hint={t('fieldPreOrderHint')}
          error={fieldErr('is_pre_order')}
        >
          <Checkbox
            name="is_pre_order"
            value="1"
            defaultChecked={initial?.is_pre_order ?? false}
            label={t('fieldPreOrderLabel')}
          />
        </FormField>

        <div className="grid md:grid-cols-2 gap-5">
          <FormField
            label={t('fieldReleaseDate')}
            hint={t('fieldReleaseDateHint')}
            error={fieldErr('release_date')}
          >
            <DatePicker
              name="release_date"
              defaultValue={initial?.release_date ?? ''}
              placeholder={t('fieldReleaseDatePlaceholder')}
            />
          </FormField>

          <FormField
            label={t('fieldDepositPercent')}
            hint={t('fieldDepositPercentHint')}
            error={fieldErr('preorder_deposit_percent')}
          >
            <Input
              name="preorder_deposit_percent"
              type="number"
              min={1}
              max={100}
              defaultValue={initial?.preorder_deposit_percent ?? 50}
              className="font-mono"
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

      {/* ───── Linked Posts (panduan / warning / catatan) ───── */}
      <section className="space-y-4">
        <SectionHeader eyebrow={t('sectionLinkedPosts')} title={t('sectionLinkedPostsTitle')} />
        <p className="text-xs text-ink/60 font-body">{t('sectionLinkedPostsHint')}</p>

        {/* Hidden inputs untuk serialize linked_posts ke backend (array of post_id). */}
        {linkedIds.map((id) => (
          <input key={id} type="hidden" name="linked_posts" value={id} />
        ))}

        {/* Selected posts — dengan kontrol urutan ↑↓ dan tombol hapus. */}
        {linkedIds.length > 0 ? (
          <ul className="space-y-2">
            {linkedIds.map((id, i) => {
              const post = linkedById.get(id);
              if (!post) return null;
              return (
                <li key={id}>
                  <Card variant="surface" hoverable={false} className="flex items-center gap-2 px-3 py-2">
                    <span className="text-primary font-bold w-6 text-center">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{post.title}</p>
                      <p className="text-[10px] text-ink/50 font-mono truncate">/{post.slug}</p>
                    </div>
                    <Button
                      type="button"
                      variant="surface"
                      size="sm"
                      flat
                      onClick={() => moveLinked(id, -1)}
                      disabled={i === 0}
                      srLabel={t('linkedMoveUp')}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="surface"
                      size="sm"
                      flat
                      onClick={() => moveLinked(id, 1)}
                      disabled={i === linkedIds.length - 1}
                      srLabel={t('linkedMoveDown')}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="accent"
                      size="sm"
                      flat
                      onClick={() => removeLinked(id)}
                      srLabel={t('linkedRemove', { value: post.title })}
                    >
                      ×
                    </Button>
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs italic text-ink/50 font-body">{t('linkedEmpty')}</p>
        )}

        {/* Picker — daftar available published posts. */}
        {availablePosts.length > 0 ? (
          <details className="border-2 border-ink/20 bg-surface">
            <summary className="cursor-pointer px-4 py-2 font-label text-label-sm uppercase font-bold text-ink hover:bg-accent/40">
              {t('linkedAddCta')} ({availablePosts.length})
            </summary>
            <ul className="border-t-2 border-ink/20 divide-y-2 divide-ink/10 max-h-72 overflow-y-auto">
              {availablePosts
                .filter((p) => !linkedIds.includes(p.id))
                .map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => toggleLinked(p.id)}
                      className="w-full text-left px-4 py-2 hover:bg-accent/30 flex items-center gap-3"
                    >
                      <span className="inline-flex items-center justify-center w-6 h-6 border-2 border-ink text-xs font-bold">
                        +
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold truncate">{p.title}</span>
                        <span className="block text-[10px] text-ink/50 font-mono truncate">/{p.slug}</span>
                      </span>
                    </button>
                  </li>
                ))}
              {availablePosts.filter((p) => !linkedIds.includes(p.id)).length === 0 && (
                <li className="px-4 py-2 text-xs italic text-ink/50 font-body">
                  {t('linkedAllAdded')}
                </li>
              )}
            </ul>
          </details>
        ) : (
          <p className="text-xs italic text-ink/50 font-body">{t('linkedNoPostsAvailable')}</p>
        )}
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