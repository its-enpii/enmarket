/**
 * Reusable form untuk create/edit blog post.
 * Pakai Tiptap untuk content (rich text) + FileUpload untuk thumbnail.
 */

'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AlertBanner } from '@/components/ui/AlertBanner';
import { FileUpload } from '@/components/admin/FileUpload';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/Input';
import { SelectSearch } from '@/components/ui/SelectSearch';
import { Textarea } from '@/components/ui/Textarea';
import { TiptapEditor } from '@/components/admin/TiptapEditor';
import { Checkbox } from '@/components/ui/Checkbox';
import { DatePicker } from '@/components/ui/DatePicker';
import { slugify } from '@/lib/format';
import { toast } from '@/components/ui/toast-store';
import type { Post, PostStatus } from '@/lib/types';

import { createPost, updatePost, ActionResult } from './actions';
import { FormFooter, FormSection } from '@/components/ui';

interface Props {
  initial?: Post;
}

export function PostForm({ initial }: Props) {
  const router = useRouter();
  const t = useTranslations('admin.posts.form');
  const tBtns = useTranslations('common.buttons');
  const isEdit = !!initial;

  // Controlled state — React 19 + Next 15 me-reset uncontrolled <input>
  // setelah form action selesai (sukses maupun gagal). Semua field pakai
  // useState + value supaya isian admin tidak hilang saat validasi gagal.
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '');
  const [status, setStatus] = useState<PostStatus>(initial?.status ?? 'draft');

  // Format published_at untuk input datetime-local (YYYY-MM-DDTHH:mm)
  const publishedAtInitial = initial?.published_at
    ? new Date(initial.published_at).toISOString().slice(0, 10)
    : '';
  const [publishedAt, setPublishedAt] = useState(publishedAtInitial);

  const actionFn = isEdit ? updatePost.bind(null, initial!.id) : createPost;
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
    if (isEdit) return;
    if (!slug) setSlug(slugify(e.target.value));
  }

  const fieldErr = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <form action={formAction} className="space-y-8">
      {/* ————— Title + Slug ————— */}
      <section className="space-y-5">
        <FormSection eyebrow={t('sectionIdentity')} title={t('sectionIdentityTitle')} />
        <div className="grid md:grid-cols-2 gap-5">
          <FormField label={t('fieldTitle')} htmlFor="title" required error={fieldErr('title')}>
            <Input
              id="title"
              name="title"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
        </div>
      </section>

      {/* ————— Konten ————— */}
      <section className="space-y-5">
        <FormSection eyebrow={t('sectionContent')} title={t('sectionContentTitle')} />
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
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
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

      {/* ————— Media ————— */}
      <section className="space-y-5">
        <FormSection eyebrow={t('sectionMedia')} title={t('sectionMediaTitle')} />
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

      {/* ————— Publish ————— */}
      <section className="space-y-5">
        <FormSection eyebrow={t('sectionPublish')} title={t('sectionPublishTitle')} />
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
            <DatePicker
              name="published_at"
              defaultValue={publishedAt}
              onChange={setPublishedAt}
              disabled={status === 'archived'}
            />
          </FormField>
        </div>
      </section>

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
