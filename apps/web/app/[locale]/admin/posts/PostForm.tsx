/**
 * Reusable form untuk create/edit blog post.
 * Pakai Tiptap untuk content (rich text) + FileUpload untuk thumbnail.
 */

'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/admin/Button';
import { FileUpload } from '@/components/admin/FileUpload';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/Input';
import { SelectSearch } from '@/components/ui/SelectSearch';
import { Textarea } from '@/components/ui/Textarea';
import { TiptapEditor } from '@/components/admin/TiptapEditor';
import { Checkbox } from '@/components/ui/Checkbox';
import { slugify } from '@/lib/format';
import type { Post, PostStatus } from '@/lib/types';

import { createPost, updatePost, ActionResult } from './actions';

interface Props {
  initial?: Post;
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

export function PostForm({ initial }: Props) {
  const router = useRouter();
  const isEdit = !!initial;

  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, fd: FormData): Promise<ActionResult> => {
      if (isEdit) {
        return await updatePost(initial!.id, _prev, fd);
      }
      return await createPost(_prev, fd);
    },
    {} as ActionResult,
  );

  const [status, setStatus] = useState<PostStatus>(initial?.status ?? 'draft');

  function autoSlug(e: React.FocusEvent<HTMLInputElement>) {
    if (isEdit) return;
    const el = document.getElementById('slug') as HTMLInputElement | null;
    if (el && !el.value) el.value = slugify(e.target.value);
  }

  const fieldErr = (k: string) => state.fieldErrors?.[k]?.[0];

  // Format published_at untuk input datetime-local (YYYY-MM-DDTHH:mm)
  const publishedAtLocal = initial?.published_at
    ? new Date(initial.published_at).toISOString().slice(0, 16)
    : '';

  return (
    <form action={formAction} className="space-y-8">
      {/* ───── Title + Slug ───── */}
      <section className="space-y-5">
        <SectionHeader eyebrow="Identitas" title="Judul & Slug" />
        <div className="grid md:grid-cols-2 gap-5">
          <FormField label="Judul" htmlFor="title" required error={fieldErr('title')}>
            <Input
              id="title"
              name="title"
              required
              maxLength={200}
              defaultValue={initial?.title}
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
        </div>
      </section>

      {/* ───── Konten ───── */}
      <section className="space-y-5">
        <SectionHeader eyebrow="Konten" title="Tulisan" />
        <FormField
          label="Ringkasan"
          htmlFor="excerpt"
          hint="Tampil di card list & meta description. Maks 500 karakter."
          error={fieldErr('excerpt')}
        >
          <Textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            maxLength={500}
            defaultValue={initial?.excerpt ?? ''}
          />
        </FormField>

        <FormField
          label="Konten"
          htmlFor="content"
          required
          hint="Heading, paragraf, list, link, quote, code, image."
          error={fieldErr('content')}
        >
          <TiptapEditor
            name="content"
            defaultValue={initial?.content ?? ''}
            placeholder="Mulai menulis… (bold, italic, H2/H3, list, link, image, code)"
          />
        </FormField>
      </section>

      {/* ───── Media ───── */}
      <section className="space-y-5">
        <SectionHeader eyebrow="Media" title="Thumbnail" />
        <FormField
          label="Thumbnail"
          htmlFor="thumbnail"
          hint={
            isEdit && initial?.thumbnail
              ? `Saat ini: ${initial.thumbnail}`
              : 'Opsional. Gambar utama untuk card list & hero detail.'
          }
          error={fieldErr('thumbnail')}
        >
          <FileUpload
            name="thumbnail"
            accept="image/*"
            maxSizeMB={10}
            defaultPreview={initial?.thumbnail ?? undefined}
          />
          {isEdit && initial?.thumbnail && (
            <Checkbox name="remove_thumbnail" value="1" label="Hapus thumbnail saat simpan" className="mt-2" />
          )}
        </FormField>
      </section>

      {/* ───── Publish ───── */}
      <section className="space-y-5">
        <SectionHeader eyebrow="Publikasi" title="Status & Jadwal" />
        <div className="grid md:grid-cols-2 gap-5">
          <FormField label="Status" htmlFor="status" required error={fieldErr('status')}>
            <SelectSearch
              name="status"
              required
              defaultValue={status}
              onChange={(v) => setStatus(v as PostStatus)}
              placeholder="Pilih status…"
              options={[
                { value: 'draft', label: 'Draft — belum publish' },
                { value: 'published', label: 'Published — tampil publik' },
                { value: 'archived', label: 'Diarsipkan — sembunyikan' },
              ]}
            />
          </FormField>

          <FormField
            label="Tanggal Publish"
            htmlFor="published_at"
            hint={
              status === 'published'
                ? 'Akan otomatis terisi sekarang() kalau dikosongkan saat status Published.'
                : 'Hanya relevan saat status Published. Kosongkan untuk draft.'
            }
            error={fieldErr('published_at')}
          >
            <Input
              id="published_at"
              name="published_at"
              type="datetime-local"
              defaultValue={publishedAtLocal}
              disabled={status === 'archived'}
            />
          </FormField>
        </div>
      </section>

      {state.error && (
        <div className="bg-accent border-2 border-ink px-4 py-2 text-sm font-bold text-ink shadow-[2px_2px_0_0_var(--color-ink)]">
          {state.error}
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t-2 border-ink">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Catatan'}
        </Button>
        <Button type="button" variant="ghost" size="md" flat onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}