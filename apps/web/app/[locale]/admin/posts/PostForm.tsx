/**
 * Reusable form untuk create/edit blog post.
 *
 * Konten memakai arsitektur BLOCK-BASED: `content` diserialisasi sebagai JSON
 * array of `PostBlock` (rich_text | code | image | video | callout) lewat hidden
 * input bernama `content`. Backend tidak berubah — kolom `posts.content` adalah
 * `longText` yang menyimpan JSON itu secara native, dan `PostContent` di sisi
 * publik tetap merender HTML lama (lihat lib/post-blocks.ts).
 */

'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AlertBanner } from '@/components/ui/AlertBanner';
import { FileUpload } from '@/components/admin/FileUpload';
import { FormField } from '@/components/admin/FormField';
import { Icon, type IconName } from '@/components/ui';
import { Image } from '@/components/ui/Image';
import { Input } from '@/components/ui/Input';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { Select } from '@/components/ui/Select';
import { SelectSearch } from '@/components/ui/SelectSearch';
import { Textarea } from '@/components/ui/Textarea';
import { TiptapEditor } from '@/components/admin/TiptapEditor';
import { Button, Card, Eyebrow } from '@/components/ui/neobrutal';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { DatePicker } from '@/components/ui/DatePicker';
import { slugify } from '@/lib/format';
import { toast } from '@/components/ui/toast-store';
import {
  CODE_LANGUAGES,
  createBlock,
  formatVideoEmbedUrl,
  parsePostContent,
  serializePostBlocks,
  type BlockType,
  type CalloutTone,
  type PostBlock,
  type RichTextBlock,
} from '@/lib/post-blocks';
import type { Post, PostStatus } from '@/lib/types';

import { createPost, updatePost, ActionResult } from './actions';
import { FormFooter, FormSection } from '@/components/ui';

interface Props {
  initial?: Post;
}

const ADD_BUTTONS: { type: BlockType; key: string; icon: IconName }[] = [
  { type: 'rich_text', key: 'addRichText', icon: 'text-block' },
  { type: 'code', key: 'addCode', icon: 'code' },
  { type: 'image', key: 'addImage', icon: 'image' },
  { type: 'video', key: 'addVideo', icon: 'play' },
  { type: 'callout', key: 'addCallout', icon: 'quote' },
];

const CALLOUT_TONES: CalloutTone[] = ['info', 'tip', 'warning'];

/** Blok default untuk post baru — id statis, aman untuk SSR + hydration. */
const INITIAL_EMPTY_BLOCK: RichTextBlock = {
  id: 'initial-rich-text',
  type: 'rich_text',
  data: { html: '' },
};

export function PostForm({ initial }: Props) {
  const router = useRouter();
  const t = useTranslations('admin.posts.form');
  const tb = useTranslations('postBlocks');
  const tBtns = useTranslations('common.buttons');
  const isEdit = !!initial;

  // Controlled state — React 19 + Next 15 me-reset uncontrolled <input>
  // setelah form action selesai (sukses maupun gagal). Semua field pakai
  // useState + value supaya isian admin tidak hilang saat validasi gagal.
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '');
  const [status, setStatus] = useState<PostStatus>(initial?.status ?? 'draft');

  // Id blok awal dibuat literal: id acak dari createBlock() berbeda antara
  // render server dan client, yang memicu mismatch hydration.
  const [blocks, setBlocks] = useState<PostBlock[]>(() => {
    const parsed = parsePostContent(initial?.content);
    return parsed.length > 0 ? parsed : [{ ...INITIAL_EMPTY_BLOCK }];
  });

  /** true saat konten lama masih HTML polos — akan dikonversi jadi blocks saat simpan. */
  const [isLegacyContent] = useState(
    () => parsePostContent(initial?.content)[0]?.id === 'legacy-root',
  );

  // Format published_at untuk input datetime-local (YYYY-MM-DDTHH:mm)
  const publishedAtInitial = initial?.published_at
    ? new Date(initial.published_at).toISOString().slice(0, 10)
    : '';
  const [publishedAt, setPublishedAt] = useState(publishedAtInitial);

  const actionFn = isEdit ? updatePost.bind(null, initial!.id) : createPost;
  const [state, formAction, pending] = useActionState(actionFn, {} as ActionResult);

  const serializedContent = useMemo(() => serializePostBlocks(blocks), [blocks]);

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

  function submitAction(formData: FormData) {
    // Kolom content `required` di backend — jangan kirim '[]' (post tanpa isi).
    if (serializedContent === '[]') {
      toast.error(tb('emptyContentError'), 4000);
      return Promise.resolve();
    }
    return formAction(formData);
  }

  function addBlock(type: BlockType) {
    setBlocks((prev) => [...prev, createBlock(type)]);
  }

  function removeBlock(id: string) {
    setBlocks((prev) =>
      prev.length <= 1 ? prev : prev.filter((block) => block.id !== id),
    );
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function patchData<T extends PostBlock>(block: T, patch: Partial<T['data']>) {
    setBlocks((prev) =>
      prev.map((item) =>
        item.id === block.id
          ? ({ ...item, data: { ...item.data, ...patch } } as PostBlock)
          : item,
      ),
    );
  }

  const fieldErr = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <form action={submitAction} className="space-y-8">
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

        {/* Serialisasi blocks → kolom content. Tanpa `name` di editor blok,
            jadi hanya string JSON ini yang sampai ke server action. */}
        <input type="hidden" name="content" value={serializedContent} />

        <div>
          <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-3">
            <div>
              <Eyebrow size="sm" color="accent">
                {tb('editorEyebrow')}
              </Eyebrow>
              <p className="font-display text-base font-black uppercase tracking-tight text-ink">
                {tb('editorTitle')}
              </p>
            </div>
            <Badge tone="surface" size="sm" thin className="font-label uppercase">
              {tb('blockCount', { count: blocks.length })}
            </Badge>
          </div>

          {isLegacyContent ? (
            <AlertBanner variant="info" className="mt-4">
              {tb('legacyNotice')}
            </AlertBanner>
          ) : null}

          <div className="mt-5 space-y-5">
            {blocks.map((block, index) => (
              <BlockCard
                key={block.id}
                block={block}
                index={index}
                total={blocks.length}
                onPatch={patchData}
                onMove={moveBlock}
                onRemove={removeBlock}
              />
            ))}
          </div>

          {/* ————— Toolbar tambah blok ————— */}
          <div className="mt-5 flex flex-wrap gap-2 border-4 border-ink bg-surface p-3 shadow-brutal-4">
            {ADD_BUTTONS.map((item) => (
              <Button
                key={item.key}
                type="button"
                variant="surface"
                size="sm"
                onClick={() => addBlock(item.type)}
                className="inline-flex items-center gap-2 font-label text-label-sm uppercase tracking-wider"
              >
                <Icon name={item.icon} size={14} />
                {tb(item.key)}
              </Button>
            ))}
          </div>
        </div>
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

// ───── Block card ─────

interface BlockCardProps {
  block: PostBlock;
  index: number;
  total: number;
  onPatch: <T extends PostBlock>(block: T, patch: Partial<T['data']>) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
}

function BlockCard({ block, index, total, onPatch, onMove, onRemove }: BlockCardProps) {
  const tb = useTranslations('postBlocks');
  const labelKey: Record<BlockType, string> = {
    rich_text: 'typeRichText',
    code: 'typeCode',
    image: 'typeImage',
    video: 'typeVideo',
    callout: 'typeCallout',
  };

  return (
    <Card variant="surface" hoverable={false} thick elevation={4} className="p-0">
      <div className="flex flex-wrap items-center gap-2 border-b-4 border-ink bg-ink px-3 py-2">
        <span className="font-label text-micro uppercase tracking-label text-surface/60">
          {String(index + 1).padStart(2, '0')}
        </span>
        <Eyebrow size="label-sm" color="surface">
          {tb(labelKey[block.type])}
        </Eyebrow>

        <div className="ml-auto flex items-center gap-1.5">
          <IconButton
            icon="arrow-up"
            label={tb('moveUp')}
            disabled={index === 0}
            onClick={() => onMove(index, -1)}
          />
          <IconButton
            icon="arrow-down"
            label={tb('moveDown')}
            disabled={index === total - 1}
            onClick={() => onMove(index, 1)}
          />
          <IconButton
            icon="close"
            label={tb('deleteBlock')}
            disabled={total <= 1}
            tone="danger"
            onClick={() => onRemove(block.id)}
          />
        </div>
      </div>

      <div className="p-3 md:p-4">
        <BlockEditor block={block} onPatch={onPatch} />
      </div>
    </Card>
  );
}

function IconButton({
  icon,
  label,
  onClick,
  disabled = false,
  tone,
}: {
  icon: 'arrow-up' | 'arrow-down' | 'close';
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'danger';
}) {
  return (
    <Button
      type="button"
      variant="surface"
      size="icon-sm"
      flat
      disabled={disabled}
      onClick={onClick}
      title={label}
      srLabel={label}
      className={
        'border-2 border-ink bg-surface text-ink shadow-brutal-2 hover:bg-accent ' +
        (tone === 'danger' ? 'hover:bg-danger hover:text-surface' : '')
      }
    >
      <Icon name={icon} size={14} />
    </Button>
  );
}

// ───── Per-type editor ─────

function BlockEditor({
  block,
  onPatch,
}: {
  block: PostBlock;
  onPatch: BlockCardProps['onPatch'];
}) {
  const tb = useTranslations('postBlocks');

  switch (block.type) {
    case 'rich_text':
      return (
        <TiptapEditor
          defaultValue={block.data.html}
          placeholder={tb('richTextPlaceholder')}
          onChange={(html) => onPatch(block, { html })}
        />
      );

    case 'code':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={tb('filename')} htmlFor={`${block.id}-filename`}>
              <Input
                id={`${block.id}-filename`}
                value={block.data.filename ?? ''}
                onChange={(e) => onPatch(block, { filename: e.target.value })}
                className="font-mono"
                placeholder="app/api/route.ts"
              />
            </FormField>

            <FormField label={tb('language')} htmlFor={`${block.id}-language`}>
              <Select
                id={`${block.id}-language`}
                value={block.data.language ?? 'typescript'}
                onChange={(e) => onPatch(block, { language: e.target.value })}
              >
                {CODE_LANGUAGES.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <Textarea
            aria-label={tb('code')}
            value={block.data.code}
            onChange={(e) => onPatch(block, { code: e.target.value })}
            rows={10}
            spellCheck={false}
            className="bg-ink font-mono text-sm text-surface focus:bg-ink"
            placeholder="const answer = 42;"
          />
        </div>
      );

    case 'image':
      return (
        <div className="space-y-4">
          <FormField label={tb('imageUrl')} htmlFor={`${block.id}-url`}>
            <Input
              id={`${block.id}-url`}
              value={block.data.url}
              onChange={(e) => onPatch(block, { url: e.target.value })}
              placeholder="https://…"
            />
          </FormField>

          <div className="flex flex-wrap items-center gap-3">
            <MediaPicker label={tb('pickFromLibrary')} onPick={(url) => onPatch(block, { url })} />
            {block.data.url ? (
              <Image
                src={block.data.url}
                alt=""
                className="h-16 w-24 border-2 border-ink bg-primary/10"
              />
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={tb('caption')} htmlFor={`${block.id}-caption`}>
              <Input
                id={`${block.id}-caption`}
                value={block.data.caption ?? ''}
                onChange={(e) => onPatch(block, { caption: e.target.value })}
              />
            </FormField>

            <FormField
              label={tb('alt')}
              htmlFor={`${block.id}-alt`}
              hint={tb('altHint')}
            >
              <Input
                id={`${block.id}-alt`}
                value={block.data.alt ?? ''}
                onChange={(e) => onPatch(block, { alt: e.target.value })}
              />
            </FormField>
          </div>

          <FormField
            label={tb('embedUrl')}
            htmlFor={`${block.id}-embed`}
            hint={tb('embedUrlHint')}
          >
            <Input
              id={`${block.id}-embed`}
              value={block.data.embed_url ?? ''}
              onChange={(e) => onPatch(block, { embed_url: e.target.value })}
              placeholder="https://…"
            />
          </FormField>
        </div>
      );

    case 'video': {
      const preview = formatVideoEmbedUrl(block.data.url);
      return (
        <div className="space-y-4">
          <FormField
            label={tb('videoUrl')}
            htmlFor={`${block.id}-url`}
            hint={tb('videoUrlHint')}
          >
            <Input
              id={`${block.id}-url`}
              value={block.data.url}
              onChange={(e) => onPatch(block, { url: e.target.value })}
              placeholder="https://youtu.be/…"
            />
          </FormField>

          {preview && preview !== block.data.url ? (
            <Eyebrow size="label-sm" color="ink-muted" className="break-all">
              {tb('embedPreview')} {preview}
            </Eyebrow>
          ) : null}

          <FormField label={tb('embedUrl')} htmlFor={`${block.id}-embed`} hint={tb('embedUrlHint')}>
            <Input
              id={`${block.id}-embed`}
              value={block.data.embed_url ?? ''}
              onChange={(e) => onPatch(block, { embed_url: e.target.value })}
              placeholder="https://…"
            />
          </FormField>

          <FormField label={tb('caption')} htmlFor={`${block.id}-caption`}>
            <Input
              id={`${block.id}-caption`}
              value={block.data.caption ?? ''}
              onChange={(e) => onPatch(block, { caption: e.target.value })}
            />
          </FormField>
        </div>
      );
    }

    case 'callout':
      return (
        <div className="space-y-4">
          <FormField label={tb('calloutTone')} htmlFor={`${block.id}-tone`}>
            <SelectSearch
              name={`callout_tone_${block.id}`}
              defaultValue={block.data.tone ?? 'info'}
              onChange={(value) =>
                onPatch(block, { tone: (value || 'info') as CalloutTone })
              }
              clearable={false}
              options={CALLOUT_TONES.map((tone) => ({
                value: tone,
                label: tb(`tone${tone.charAt(0).toUpperCase()}${tone.slice(1)}`),
              }))}
            />
          </FormField>

          <Textarea
            aria-label={tb('typeCallout')}
            value={block.data.text}
            onChange={(e) => onPatch(block, { text: e.target.value })}
            rows={4}
            placeholder={tb('calloutPlaceholder')}
          />
        </div>
      );

    default:
      return null;
  }
}
