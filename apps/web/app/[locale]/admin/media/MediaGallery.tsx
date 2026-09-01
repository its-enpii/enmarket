'use client';

/**
 * MediaGallery — client component untuk gallery + filter + picker.
 *
 * Data: di-fetch di server (parent page), kirim sebagai `initialItems` prop
 * (serializable). Filter & search di-handle client-side karena dataset
 * kecil (≤ a few hundred items) untuk MVP.
 *
 * Picker mode: kalau active, click pada item card → postMessage ke opener
 * + close. Parent window listener ada di `PreviewImagesManager.tsx` &
 * `MediaPicker.tsx`.
 *
 * TODO (backend ready): tambah endpoint `/api/admin/media` supaya file
 * yang tidak ke-attach ke entity (orphan upload) juga muncul.
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/neobrutal';
import {
  filterMedia,
  type FilterMediaOptions,
  type MediaItem,
} from '@/lib/media-shared';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { SelectSearch } from '@/components/ui/SelectSearch';
import { Eyebrow } from '@/components/ui/neobrutal';
import { CornerAccent } from '@/components/ui/CornerAccent';
import { Image } from '@/components/ui/Image';
import { ImagePlaceholder } from '@/components/ui';

interface Props {
  initialItems: MediaItem[];
  initialFilters: FilterMediaOptions;
  pickerMode: boolean;
}

export function MediaGallery({ initialItems, initialFilters, pickerMode }: Props) {
  const t = useTranslations('admin.media');
  const [items] = useState<MediaItem[]>(initialItems);
  const [filters, setFilters] = useState<FilterMediaOptions>(initialFilters);

  const filtered = filterMedia(items, filters);

  function handlePick(item: MediaItem) {
    if (!pickerMode) return;
    if (window.opener) {
      window.opener.postMessage(
        { type: 'media-pick', url: item.url, filename: item.filename },
        window.location.origin,
      );
      window.close();
    }
  }

  return (
    <>
      {/* Filter bar */}
      <Card variant="surface" className="p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <FormField className="flex-1 min-w-[200px]" label={t('searchLabel')} htmlFor="media-search">
            <Input
              id="media-search"
              variant="flat"
              type="text"
              value={filters.q ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder={t('searchPlaceholder')}
            />
          </FormField>

          <div className="w-44">
            <SelectSearch
              name="source"
              label={t('source.label')}
              value={filters.source ?? 'all'}
              placeholder={t('source.all')}
              options={[
                { value: 'all', label: t('source.all') },
                { value: 'product', label: t('source.product') },
                { value: 'post', label: t('source.post') },
              ]}
              onChange={(v) =>
                setFilters((f) => ({ ...f, source: v as 'all' | 'product' | 'post' }))
              }
              clearable={false}
            />
          </div>

          <div className="w-44">
            <SelectSearch
              name="type"
              label={t('type.label')}
              value={filters.type ?? 'all'}
              placeholder={t('type.all')}
              options={[
                { value: 'all', label: t('type.all') },
                { value: 'image', label: t('type.image') },
                { value: 'video', label: t('type.video') },
                { value: 'other', label: t('type.other') },
              ]}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  type: v as 'all' | 'image' | 'video' | 'other',
                }))
              }
              clearable={false}
            />
          </div>

          <div className="ml-auto self-end">
            <p className="font-label text-[10px] uppercase tracking-wider text-ink/60">
              {filtered.length !== items.length
                ? t('countWithTotal', { count: filtered.length, total: items.length })
                : t('count', { count: filtered.length })}
            </p>
          </div>
        </div>
      </Card>

      {/* Gallery */}
      {items.length === 0 ? (
        <EmptyGallery hasItems={false} />
      ) : filtered.length === 0 ? (
        <EmptyGallery hasItems />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, i) => (
            <MediaCard
              key={`${item.url}-${i}`}
              item={item}
              onClick={() => handlePick(item)}
              pickerMode={pickerMode}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ───── Sub-components ─────

function MediaCard({
  item,
  onClick,
  pickerMode,
}: {
  item: MediaItem;
  onClick: () => void;
  pickerMode: boolean;
}) {
  const t = useTranslations('admin.media');
  return (
    <Card
      as={pickerMode ? 'button' : 'div'}
      type={pickerMode ? 'button' : undefined}
      onClick={onClick}
      variant="surface"
      hoverable={false}
      className="block text-left overflow-hidden cursor-pointer"
    >
      {/* Preview */}
      <div className="aspect-square bg-ink/10 border-b-2 border-ink overflow-hidden relative">
        {item.type === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <Image
            src={item.url}
            alt={item.filename}
            className="w-full h-full"
          />
        ) : item.type === 'video' ? (
          <ImagePlaceholder>
            <span className="font-display text-3xl">▶</span>
          </ImagePlaceholder>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface text-ink">
            <span className="font-display text-2xl">📎</span>
          </div>
        )}

        {/* Source badge */}
        <span
          className={
            'absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2 border-ink ' +
            (item.source === 'product' ? 'bg-accent text-ink' : 'bg-primary text-surface')
          }
        >
          {item.source === 'product' ? t('sourceBadge.product') : t('sourceBadge.post')}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-mono text-xs text-ink truncate" title={item.filename}>
          {item.filename}
        </p>
        <p className="mt-1 font-label text-[10px] uppercase tracking-wide text-ink/60 truncate">
          {item.sourceLabel}
        </p>
      </div>
    </Card>
  );
}

function EmptyGallery({ hasItems }: { hasItems: boolean }) {
  const t = useTranslations('admin.media.empty');
  return (
    <Card variant="surface" className="p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="relative inline-block mb-6">
          <Card variant="filled-primary" thick elevation={10} hoverable={false} className="w-32 h-32 flex items-center justify-center">
            <span className="font-display text-5xl font-black uppercase text-surface">
              ◰
            </span>
          </Card>
          <CornerAccent size="w-16 h-16" className="absolute -bottom-5 -right-5 z-10" />
        </div>
        <Eyebrow size="sm" color="accent" className="mb-2">
          {hasItems ? t('eyebrowMatch') : t('eyebrowEmpty')}
        </Eyebrow>
        <h3 className="font-display text-2xl md:text-3xl font-black uppercase leading-[0.95] tracking-tight text-ink">
          {hasItems ? t('titleMatch') : t('titleEmpty')}
        </h3>
        <p className="mt-3 font-body text-body-md text-ink/70">
          {hasItems ? t('hintMatch') : t('hintEmpty')}
        </p>
      </div>
    </Card>
  );
}
