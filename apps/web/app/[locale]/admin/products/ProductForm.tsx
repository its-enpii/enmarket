/**
 * Reusable form untuk create/edit produk.
 */

'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AlertBanner } from '@/components/ui/AlertBanner';
import { Button } from '@/components/ui/neobrutal';
import { FormFooter } from '@/components/ui';
import { FileUpload } from '@/components/admin/FileUpload';
import { MediaPickerModal } from '@/components/admin/MediaPickerModal';
import { FormField } from '@/components/admin/FormField';
import { Checkbox } from '@/components/ui/Checkbox';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Input } from '@/components/ui/Input';
import { SelectSearch } from '@/components/ui/SelectSearch';
import { Textarea } from '@/components/ui/Textarea';
import { Card, Disclosure } from '@/components/ui/neobrutal';
import { slugify } from '@/lib/format';
import { toast } from '@/components/ui/toast-store';
import type { Category, LinkedPost, Product } from '@/lib/types';

import { createProduct, updateProduct, ActionResult } from './actions';
import { DatePicker } from '@/components/ui/DatePicker';
import { FormSection } from '@/components/ui';
import { Image } from '@/components/ui/Image';

interface Props {
  categories: Category[];
  initial?: Product;
  /** Post published yang tersedia untuk di-link — di-load server-side. */
  availablePosts?: LinkedPost[];
}

/** Tipe produk yang butuh file upload (download/bundle). */
const TIPE_NEEDS_FILE = new Set(['download', 'bundle']);

export function ProductForm({ categories, initial, availablePosts = [] }: Props) {
  const router = useRouter();
  const t = useTranslations('admin.products.form');
  const tProd = useTranslations('admin.products');
  const tBtns = useTranslations('common.buttons');
  const isEdit = !!initial;

  // Catatan: React 19 + Next 15 me-reset uncontrolled <input> setelah form
  // action selesai (sukses maupun gagal). Untuk itu SEMUA field di sini
  // pakai controlled inputs — values di state, bukan defaultValue di DOM.
  // Saat submit gagal, React tinggal re-render dengan state values yang
  // sama → form tetap berisi isian admin.
  const [nama, setNama] = useState(initial?.nama ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [categoryId, setCategoryId] = useState<string>(
    initial?.category_id ? String(initial.category_id) : '',
  );
  const [isFree, setIsFree] = useState(initial?.is_free ?? false);
  const [harga, setHarga] = useState(() => {
    const raw = initial?.harga ?? '';
    if (!raw) return '';
    const num = parseInt(String(raw), 10);
    return Number.isNaN(num) ? '' : String(num);
  });
  const [tipe, setTipe] = useState(initial?.tipe ?? 'download');
  const [status, setStatus] = useState(initial?.status ?? 'draft');
  const [downloadExpiry, setDownloadExpiry] = useState<string>(
    initial?.download_expiry_days != null ? String(initial.download_expiry_days) : '7',
  );
  const [deskripsi, setDeskripsi] = useState(initial?.deskripsi ?? '');
  const [isPreOrder, setIsPreOrder] = useState(initial?.is_pre_order ?? false);
  const [releaseDate, setReleaseDate] = useState(initial?.release_date ?? '');
  const [depositPercent, setDepositPercent] = useState<string>(
    initial?.deposit_percent != null ? String(initial.deposit_percent) : '50',
  );

  const actionFn = isEdit ? updateProduct.bind(null, initial!.id) : createProduct;
  const [state, formAction, pending] = useActionState(actionFn, {} as ActionResult);

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message, 3000);
      if (state.redirectTo) {
        router.push(state.redirectTo);
      }
    }
  }, [state, router]);

  const [fitur, setFitur] = useState<string[]>(() => {
    if (Array.isArray(initial?.fitur)) return initial.fitur;
    if (typeof initial?.fitur === 'string') {
      try {
        const parsed = JSON.parse(initial.fitur);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });
  const [newFitur, setNewFitur] = useState('');
  // Linked posts — array of post_id yang dipilih admin. Urutan = index array.
  const [libraryImages, setLibraryImages] = useState<string[]>([]);
  const [linkedIds, setLinkedIds] = useState<number[]>(
    (initial?.linked_posts ?? []).map((p) => p.id),
  );

  function autoSlug(e: React.FocusEvent<HTMLInputElement>) {
    if (isEdit) return;
    setSlug(slugify(e.target.value));
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

  // Free ↔ Pre-order mutual exclusion: backend reject kalau keduanya
  // aktif. UI handle di sini supaya admin tidak bisa centang keduanya.
  function handleFreeChange(checked: boolean) {
    setIsFree(checked);
    if (checked) {
      setIsPreOrder(false);
      setHarga('0');
    }
  }

  function handlePreOrderChange(checked: boolean) {
    setIsPreOrder(checked);
    if (checked) {
      setIsFree(false);
    }
  }

  const fieldErr = (k: string) => state.fieldErrors?.[k]?.[0];

  // Serialize fitur as JSON for the hidden input
  const fiturJson = JSON.stringify(fitur);

  // Hidden inputs: satu `<input name="linked_posts">` per post_id, urutan
  // sesuai array (admin atur via tombol ↑↓). Empty array → sync detach semua.
  const linkedById = new Map(availablePosts.map((p) => [p.id, p]));

  // Derived: apakah tipe produk butuh file upload?
  const needsFile = TIPE_NEEDS_FILE.has(tipe);

  return (
    <form action={formAction} className="space-y-8">
      {/* ————— Identitas ————— */}
      <section className="space-y-5">
        <FormSection eyebrow={t('sectionIdentity')} title={t('sectionIdentityTitle')} />
        <div className="grid md:grid-cols-2 gap-5">
          <FormField label={t('fieldName')} htmlFor="nama" required error={fieldErr('nama')}>
            <Input
              id="nama"
              name="nama"
              required
              maxLength={200}
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

          <FormField label={t('fieldCategory')} htmlFor="category_id" error={fieldErr('category_id')}>
            <SelectSearch
              name="category_id"
              options={categories.map((c) => ({
                value: String(c.id),
                label: c.nama,
                hint: c.slug ?? undefined,
              }))}
              value={categoryId}
              onChange={setCategoryId}
              placeholder={t('categoryPlaceholder')}
              clearable
              showAllOption={{ value: '', label: t('categoryPlaceholder') }}
            />
          </FormField>
        </div>
      </section>

      {/* ————— Harga & Tipe ————— */}
      <section className="space-y-5">
        <FormSection eyebrow={t('sectionPricing')} title={t('sectionPricingTitle')} />
        <FormField
          htmlFor="is_free"
          label={t('fieldFree')}
          hint={t('fieldFreeHint')}
          error={fieldErr('is_free')}
        >
          <Checkbox
            name="is_free"
            value="1"
            checked={isFree}
            onChange={(e) => handleFreeChange(e.currentTarget.checked)}
            label={t('fieldFree')}
          />
        </FormField>
        <div className="grid md:grid-cols-2 gap-5">
          <FormField label={t('fieldPrice')} htmlFor="harga" required error={fieldErr('harga')}>
            {/* Hidden input fallback: disabled TIDAK submit via FormData, jadi
                backend reject dengan "harga required" walau admin toggle is_free. */}
            {isFree && <input type="hidden" name="harga" value="0" />}
            <CurrencyInput
              id="harga"
              name={isFree ? undefined : 'harga'}
              required={!isFree}
              disabled={isFree}
              value={isFree ? '0' : harga}
              onChange={setHarga}
              readOnly={isFree}
            />
          </FormField>

          <FormField label={t('fieldType')} htmlFor="tipe" required error={fieldErr('tipe')}>
            <SelectSearch
              name="tipe"
              required
              value={tipe}
              onChange={(v) => setTipe(v as typeof tipe)}
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
              value={status}
              onChange={(v) => setStatus(v as typeof status)}
              placeholder={t('statusPlaceholder')}
              options={[
                { value: 'draft', label: t('statusDraft') },
                { value: 'aktif', label: t('statusActive') },
                { value: 'tidak_dijual', label: t('statusNotForSale') },
              ]}
            />
          </FormField>

          {/* Download expiry hanya relevan untuk tipe download/bundle */}
          {needsFile && (
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
                value={downloadExpiry}
                onChange={(e) => setDownloadExpiry(e.target.value)}
              />
            </FormField>
          )}
        </div>
      </section>

      {/* ————— Pre-Order ————— */}
      {/* Mutual exclusion: pre-order tidak bisa dikombinasi dengan gratis */}
      {!isFree && (
        <section className="space-y-5">
          <FormSection eyebrow={t('sectionPreOrder')} title={t('sectionPreOrderTitle')} />
          <FormField
            htmlFor="is_pre_order"
            label={t('fieldPreOrder')}
            hint={t('fieldPreOrderHint')}
            error={fieldErr('is_pre_order')}
          >
            <Checkbox
              name="is_pre_order"
              value="1"
              checked={isPreOrder}
              onChange={(e) => handlePreOrderChange(e.currentTarget.checked)}
              label={t('fieldPreOrderLabel')}
            />
          </FormField>

          {/* Release date & deposit hanya muncul kalau pre-order aktif */}
          {isPreOrder && (
            <div className="grid md:grid-cols-2 gap-5">
              <FormField
                htmlFor="release_date"
                label={t('fieldReleaseDate')}
                hint={t('fieldReleaseDateHint')}
                required
                error={fieldErr('release_date')}
              >
                <DatePicker
                  name="release_date"
                  defaultValue={releaseDate}
                  placeholder={t('fieldReleaseDatePlaceholder')}
                />
              </FormField>

              <FormField
                htmlFor="preorder_deposit_percent"
                label={t('fieldDepositPercent')}
                hint={t('fieldDepositPercentHint')}
                required
                error={fieldErr('preorder_deposit_percent')}
              >
                <Input
                  name="preorder_deposit_percent"
                  type="number"
                  min={1}
                  max={100}
                  value={depositPercent}
                  onChange={(e) => setDepositPercent(e.target.value)}
                  className="font-mono"
                />
              </FormField>
            </div>
          )}
        </section>
      )}

      {/* ————— Deskripsi ————— */}
      <section className="space-y-5">
        <FormSection eyebrow={t('sectionContent')} title={t('sectionContentTitle')} />
        <FormField label={t('fieldDescription')} htmlFor="deskripsi" required error={fieldErr('deskripsi')}>
          <Textarea
            id="deskripsi"
            name="deskripsi"
            rows={5}
            required
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
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

      {/* ————— Linked Posts (panduan / warning / catatan) ————— */}
      <section className="space-y-4">
        <FormSection eyebrow={t('sectionLinkedPosts')} title={t('sectionLinkedPostsTitle')} />
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
          <Disclosure
            label={
              <span className="px-4 py-2 font-label text-label-sm uppercase font-bold text-ink hover:bg-accent/40">
                {t('linkedAddCta')} ({availablePosts.length})
              </span>
            }
            className="border-2 border-ink/20 bg-surface"
          >
            <ul className="border-t-2 border-ink/20 divide-y-2 divide-ink/10 max-h-72 overflow-y-auto">
              {availablePosts
                .filter((p) => !linkedIds.includes(p.id))
                .map((p) => (
                  <li key={p.id}>
                    <Button
                      type="button"
                      variant="surface"
                      size="sm"
                      onClick={() => toggleLinked(p.id)}
                      className="w-full justify-start text-left px-4 py-2 hover:bg-accent/30 gap-3"
                    >
                      <span className="inline-flex items-center justify-center w-6 h-6 border-2 border-ink text-xs font-bold">
                        +
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold truncate">{p.title}</span>
                        <span className="block text-[10px] text-ink/50 font-mono truncate">/{p.slug}</span>
                      </span>
                    </Button>
                  </li>
                ))}
              {availablePosts.filter((p) => !linkedIds.includes(p.id)).length === 0 && (
                <li className="px-4 py-2 text-xs italic text-ink/50 font-body">
                  {t('linkedAllAdded')}
                </li>
              )}
            </ul>
          </Disclosure>
        ) : (
          <p className="text-xs italic text-ink/50 font-body">{t('linkedNoPostsAvailable')}</p>
        )}
      </section>

      {/* ————— Gambar Preview (hanya saat create) ————— */}
      {!isEdit && (
      <section className="space-y-5">
        <FormSection mark={false} eyebrow={tProd('previewImagesEyebrow').replace('✎ ', '')} title={tProd('previewImagesTitle')} />
        <FormField
          label={tProd('previewImagesTitle')}
          htmlFor="preview_images"
          hint={tProd('previewImagesSubtitle')}
          error={fieldErr('preview_images')}
        >
          <input type="hidden" name="preview_images_urls" value={JSON.stringify(libraryImages)} />
          
          <div className="space-y-3">
            {libraryImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {libraryImages.map((url, i) => (
                  <div key={url} className="relative border-2 border-ink bg-surface p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <Image src={url} alt="Library preview" className="h-16 w-16 border border-ink" />
                    <Button
                      type="button"
                      variant="surface"
                      size="sm"
                      onClick={() => setLibraryImages(libraryImages.filter((_, idx) => idx !== i))}
                      className="absolute -top-2 -right-2 h-5 w-5 px-0 py-0 text-xs"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[240px]">
                <FileUpload name="preview_images" accept="image/*" multiple maxSizeMB={10} />
              </div>
              <div className="shrink-0">
                <MediaPickerModal
                  onPick={(url) => {
                    if (!libraryImages.includes(url) && libraryImages.length < 5) {
                      setLibraryImages((prev) => [...prev, url]);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </FormField>
      </section>
      )}

      {/* ————— File produk (hanya untuk tipe download/bundle) ————— */}
      {needsFile && (
        <section className="space-y-5">
          <FormSection eyebrow={t('sectionFile')} title={t('sectionFileTitle')} />
          <FormField
            label={t('fieldFile')}
            htmlFor="file"
            hint={
              isEdit && initial?.file_url
                ? t('fieldFileHintCurrent', { url: initial.file_url })
                : t('fieldFileHintEmpty')
            }
            required={!isEdit || !initial?.file_url}
            error={fieldErr('file')}
          >
            <FileUpload name="file" accept=".zip,.rar,.7z,.pdf,.apk,.exe,.tar.gz" maxSizeMB={500} />
            {isEdit && initial?.file_url && (
              <Checkbox name="remove_file" value="1" label={t('removeFile')} className="mt-2" />
            )}
          </FormField>
        </section>
      )}

      {state.error && (
        <AlertBanner variant="error">
          {state.error}
        </AlertBanner>
      )}

      <FormFooter
        pending={pending}
        submitLabel={pending ? t('submitPending') : isEdit ? t('submitSave') : t('submitCreate')}
        cancelLabel={tBtns('cancel')}
        onCancel={() => router.back()}
        className="border-t-2 border-ink"
      />
    </form>
  );
}
