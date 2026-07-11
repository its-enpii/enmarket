/**
 * Reusable form untuk create/edit produk.
 */

'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/admin/Button';
import { FileUpload } from '@/components/admin/FileUpload';
import { FormField } from '@/components/admin/FormField';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { SelectSearch } from '@/components/ui/SelectSearch';
import { Textarea } from '@/components/ui/Textarea';
import { slugify } from '@/lib/format';
import type { Category, Product, StatusProduct, TipeProduct } from '@/lib/types';

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
  const isEdit = !!initial;

  const action = isEdit ? updateProduct.bind(null, initial!.id) : createProduct;

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
        <SectionHeader eyebrow="Identitas" title="Informasi Dasar" />
        <div className="grid md:grid-cols-2 gap-5">
          <FormField label="Nama" htmlFor="nama" required error={fieldErr('nama')}>
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
            label="Slug"
            htmlFor="slug"
            hint="URL-friendly identifier. Huruf kecil, angka, strip."
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

          <FormField label="Kategori" htmlFor="category_id" error={fieldErr('category_id')}>
            <SelectSearch
              name="category_id"
              options={categories.map((c) => ({
                value: String(c.id),
                label: c.nama,
                hint: c.slug ?? undefined,
              }))}
              defaultValue={initial?.category_id ? String(initial.category_id) : ''}
              placeholder="— Tanpa Kategori —"
              clearable
              showAllOption={{ value: '', label: '— Tanpa Kategori —' }}
            />
          </FormField>
        </div>
      </section>

      {/* ───── Harga & Tipe ───── */}
      <section className="space-y-5">
        <SectionHeader eyebrow="Penjualan" title="Harga, Tipe, dan Status" />
        <div className="grid md:grid-cols-2 gap-5">
          <FormField label="Harga (Rp)" htmlFor="harga" required error={fieldErr('harga')}>
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

          <FormField label="Tipe" htmlFor="tipe" required error={fieldErr('tipe')}>
            <SelectSearch
              name="tipe"
              required
              defaultValue={initial?.tipe ?? 'download'}
              placeholder="Pilih tipe…"
              options={[
                { value: 'download', label: 'Download — hanya file' },
                { value: 'license', label: 'License — hanya key' },
                { value: 'bundle', label: 'Bundle — file + key' },
              ]}
            />
          </FormField>

          <FormField label="Status" htmlFor="status" required error={fieldErr('status')}>
            <SelectSearch
              name="status"
              required
              defaultValue={initial?.status ?? 'draft'}
              placeholder="Pilih status…"
              options={[
                { value: 'draft', label: 'Draft — belum dijual' },
                { value: 'aktif', label: 'Aktif — tampil di toko' },
                { value: 'tidak_dijual', label: 'Tidak Dijual' },
              ]}
            />
          </FormField>

          <FormField
            label="Download Expiry (hari)"
            htmlFor="download_expiry_days"
            hint="Untuk tipe download/bundle. Berapa hari link download berlaku."
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
        <SectionHeader eyebrow="Konten" title="Deskripsi & Fitur" />
        <FormField label="Deskripsi" htmlFor="deskripsi" required error={fieldErr('deskripsi')}>
          <Textarea
            id="deskripsi"
            name="deskripsi"
            rows={5}
            required
            defaultValue={initial?.deskripsi ?? ''}
          />
        </FormField>

        <FormField label="Fitur / Isi Produk" htmlFor="fitur-input" hint="Maks 20 item." error={fieldErr('fitur')}>
          <input type="hidden" name="fitur" value={fiturJson} />
          <div className="space-y-2">
            {fitur.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 border-2 border-ink bg-surface px-3 py-2"
              >
                <span className="text-primary font-bold">{i + 1}.</span>
                <span className="flex-1 text-sm">{f}</span>
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  flat
                  onClick={() => removeFitur(i)}
                  srLabel={`Hapus fitur ${f}`}
                >
                  ×
                </Button>
              </div>
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
                placeholder="Tulis fitur lalu Enter / klik +"
                className="flex-1"
                variant="flat"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                flat
                onClick={addFitur}
                srLabel="Tambah fitur"
              >
                +
              </Button>
            </div>
          </div>
        </FormField>
      </section>

      {/* ───── File produk ───── */}
      <section className="space-y-5">
        <SectionHeader eyebrow="Distribusi" title="File Produk" />
        <FormField
          label="File Produk"
          htmlFor="file"
          hint={isEdit && initial?.file_url ? `Saat ini: ${initial.file_url}` : 'Upload file yang akan dikirim ke pembeli.'}
          error={fieldErr('file')}
        >
          <FileUpload name="file" accept=".zip,.rar,.7z,.pdf,.apk,.exe,.tar.gz" maxSizeMB={500} />
          {isEdit && initial?.file_url && (
            <Checkbox name="remove_file" value="1" label="Hapus file terlampir saat simpan" className="mt-2" />
          )}
        </FormField>
      </section>

      {state.error && (
        <div className="bg-accent border-2 border-ink px-4 py-2 text-sm font-bold text-ink shadow-[2px_2px_0_0_var(--color-ink)]">
          {state.error}
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t-2 border-ink">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Produk'}
        </Button>
        <Button type="button" variant="ghost" size="md" flat onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}