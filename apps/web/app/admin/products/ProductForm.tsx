/**
 * Reusable form untuk create/edit produk.
 */

'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/admin/Button';
import { FileUpload } from '@/components/admin/FileUpload';
import { FormField } from '@/components/admin/FormField';
import { slugify } from '@/lib/format';
import type { Category, Product, StatusProduct, TipeProduct } from '@/lib/types';

import { createProduct, updateProduct, ActionResult } from './actions';

interface Props {
  categories: Category[];
  initial?: Product;
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
    <form action={formAction} className="space-y-6">
      {/* ───── Basic info ───── */}
      <div className="grid md:grid-cols-2 gap-5">
        <FormField label="Nama" htmlFor="nama" required error={fieldErr('nama')}>
          <input
            id="nama"
            name="nama"
            required
            maxLength={200}
            defaultValue={initial?.nama}
            onBlur={autoSlug}
            className="w-full bg-surface border-2 border-ink px-3 py-2 text-ink focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
          />
        </FormField>

        <FormField
          label="Slug"
          htmlFor="slug"
          hint="URL-friendly identifier. Huruf kecil, angka, strip."
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

        <FormField label="Kategori" htmlFor="category_id" error={fieldErr('category_id')}>
          <select
            id="category_id"
            name="category_id"
            defaultValue={initial?.category_id ?? ''}
            className="w-full bg-surface border-2 border-ink px-3 py-2 text-ink focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
          >
            <option value="">— Tanpa Kategori —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nama}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Harga (Rp)" htmlFor="harga" required error={fieldErr('harga')}>
          <input
            id="harga"
            name="harga"
            type="number"
            min="0"
            step="1000"
            required
            defaultValue={initial?.harga ?? ''}
            className="w-full bg-surface border-2 border-ink px-3 py-2 text-ink focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
          />
        </FormField>

        <FormField label="Tipe" htmlFor="tipe" required error={fieldErr('tipe')}>
          <select
            id="tipe"
            name="tipe"
            required
            defaultValue={initial?.tipe ?? 'download'}
            className="w-full bg-surface border-2 border-ink px-3 py-2 text-ink focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
          >
            <option value="download">Download — hanya file</option>
            <option value="license">License — hanya key</option>
            <option value="bundle">Bundle — file + key</option>
          </select>
        </FormField>

        <FormField label="Status" htmlFor="status" required error={fieldErr('status')}>
          <select
            id="status"
            name="status"
            required
            defaultValue={initial?.status ?? 'draft'}
            className="w-full bg-surface border-2 border-ink px-3 py-2 text-ink focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
          >
            <option value="draft">Draft — belum dijual</option>
            <option value="aktif">Aktif — tampil di toko</option>
            <option value="tidak_dijual">Tidak Dijual</option>
          </select>
        </FormField>

        <FormField
          label="Download Expiry (hari)"
          htmlFor="download_expiry_days"
          hint="Untuk tipe download/bundle. Berapa hari link download berlaku."
          error={fieldErr('download_expiry_days')}
        >
          <input
            id="download_expiry_days"
            name="download_expiry_days"
            type="number"
            min="1"
            max="365"
            defaultValue={initial?.download_expiry_days ?? 7}
            className="w-full bg-surface border-2 border-ink px-3 py-2 text-ink focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
          />
        </FormField>
      </div>

      {/* ───── Deskripsi ───── */}
      <FormField label="Deskripsi" htmlFor="deskripsi" required error={fieldErr('deskripsi')}>
        <textarea
          id="deskripsi"
          name="deskripsi"
          rows={5}
          required
          defaultValue={initial?.deskripsi ?? ''}
          className="w-full bg-surface border-2 border-ink px-3 py-2 text-ink focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all resize-y"
        />
      </FormField>

      {/* ───── Fitur (dynamic array) ───── */}
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
              <button
                type="button"
                onClick={() => removeFitur(i)}
                className="bg-accent border-2 border-ink px-2 py-0.5 text-xs font-bold shadow-[2px_2px_0_0_var(--color-ink)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--color-ink)] transition-all"
              >
                ×
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={newFitur}
              onChange={(e) => setNewFitur(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFitur();
                }
              }}
              placeholder="Tulis fitur lalu Enter / klik +"
              className="flex-1 bg-surface border-2 border-ink px-3 py-2 text-sm focus:outline-none focus:shadow-[3px_3px_0_0_var(--color-ink)] transition-all"
            />
            <button
              type="button"
              onClick={addFitur}
              className="bg-primary text-surface border-2 border-ink px-4 py-2 text-sm font-bold shadow-[3px_3px_0_0_var(--color-ink)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
            >
              +
            </button>
          </div>
        </div>
      </FormField>

      {/* ───── File produk ───── */}
      <FormField
        label="File Produk"
        htmlFor="file"
        hint={isEdit && initial?.file_url ? `Saat ini: ${initial.file_url}` : 'Upload file yang akan dikirim ke pembeli.'}
        error={fieldErr('file')}
      >
        <FileUpload name="file" accept=".zip,.rar,.7z,.pdf,.apk,.exe,.tar.gz" maxSizeMB={500} />
        {isEdit && initial?.file_url && (
          <label className="mt-2 flex items-center gap-2 text-xs">
            <input type="checkbox" name="remove_file" value="1" />
            <span>Hapus file terlampir saat simpan</span>
          </label>
        )}
      </FormField>

      {state.error && (
        <div className="bg-accent border-2 border-ink px-4 py-2 text-sm font-bold text-ink shadow-[2px_2px_0_0_var(--color-ink)]">
          {state.error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Produk'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}