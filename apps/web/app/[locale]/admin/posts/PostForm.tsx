/**
 * Reusable form untuk create/edit blog post.
 * Pakai Tiptap untuk content (rich text) + FileUpload untuk thumbnail.
 */

'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { FileUpload } from '@/components/admin/FileUpload';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/Input';
import { SelectSearch } from '@/components/ui/SelectSearch';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/neobrutal';
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
  const t = useTranslations('admin.posts.form');
  const tBtns = useTranslations('common.buttons');
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
        <SectionHeader eyebrow={t('sectionIdentity')} title={t('sectionIdentityTitle')} />
        <div className="grid md:grid-cols-2 gap-5">
          <FormField label={t('fieldTitle')} htmlFor="title" required error={fieldErr('title')}>
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
        </div>
      </section>

      {/* ───── Konten ───── */}
      <section className="space-y-5">
        <SectionHeader eyebrow={t('sectionContent')} title={t('sectionContentTitle')} />
        <FormField
          label={t('fieldExcerpt')}
          htmlFor="excerpt"
          hint={t('fieldExcerptHint')}
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
          label={t('fieldContent')}
          htmlFor="content"
          required
          hint={t('fieldContentHint')}
          error={fieldErr('content')}
        >
          <TiptapEditor
            name="content"
            defaultValue={initial?.content ?? ''}
            placeholder={t('fieldContentPlaceholder')}
          />
        </FormField>
      </section>

      {/* ───── Media ───── */}
      <section className="space-y-5">
        <SectionHeader eyebrow={t('sectionMedia')} title={t('sectionMediaTitle')} />
        <FormField
          label={t('fieldThumbnail')}
          htmlFor="thumbnail"
          hint={
            isEdit && initial?.thumbnail
              ? t('fieldThumbnailHintCurrent', { url: initial.thumbnail })
              : t('fieldThumbnailHintEmpty')
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
            <Checkbox name="remove_thumbnail" value="1" label={t('removeThumbnail')} className="mt-2" />
          )}
        </FormField>
      </section>

      {/* ───── Publish ───── */}
      <section className="space-y-5">
        <SectionHeader eyebrow={t('sectionPublish')} title={t('sectionPublishTitle')} />
        <div className="grid md:grid-cols-2 gap-5">
          <FormField label={t('fieldStatus')} htmlFor="status" required error={fieldErr('status')}>
            <SelectSearch
              name="status"
              required
              defaultValue={status}
              onChange={(v) => setStatus(v as PostStatus)}
              placeholder={t('statusPlaceholder')}
              options={[
                { value: 'draft', label: t('statusDraft') },
                { value: 'published', label: t('statusPublished') },
                { value: 'archived', label: t('statusArchived') },
              ]}
            />
          </FormField>

          <FormField
            label={t('fieldPublishedAt')}
            htmlFor="published_at"
            hint={
              status === 'published'
                ? t('fieldPublishedAtHintActive')
                : t('fieldPublishedAtHintInactive')
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