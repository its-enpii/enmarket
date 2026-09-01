'use client';

import { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { Input } from '@/components/ui/Input';
import { SelectSearch } from '@/components/ui/SelectSearch';
import { fetchMediaLibrary } from '@/lib/media-actions';
import {
  filterMedia,
  type FilterMediaOptions,
  type MediaItem,
} from '@/lib/media-shared';

interface Props {
  /** Callback saat gambar dipilih dari modal. */
  onPick: (url: string) => void;
  /** Trigger button label. Default: "Pakai dari Library". */
  triggerLabel?: string;
  /** Custom trigger button variant. Default: "accent". */
  variant?: 'surface' | 'primary' | 'accent';
  disabled?: boolean;
}

export function MediaPickerModal({
  onPick,
  triggerLabel,
  variant = 'accent',
  disabled = false,
}: Props) {
  const t = useTranslations('admin.media');
  const tShared = useTranslations('admin.shared');
  const tCommon = useTranslations('common.ui');
  const tBtn = useTranslations('common.buttons');
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, startTransition] = useTransition();
  const [fetched, setFetched] = useState(false);
  const [filters, setFilters] = useState<FilterMediaOptions>({
    q: '',
    source: 'all',
    type: 'all',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || fetched) return;
    startTransition(async () => {
      const res = await fetchMediaLibrary();
      setItems(res);
      setFetched(true);
    });
  }, [open, fetched]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const filtered = filterMedia(items, filters);

  function handleSelect(url: string) {
    onPick(url);
    setOpen(false);
  }

  const modal = open ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-picker-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
    >
      <Button
        type="button"
        variant="surface"
        size="sm"
        tabIndex={-1}
        aria-label={tCommon('closeDialog')}
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-ink/70 cursor-default animate-fade-in"
      />

      <div className="relative bg-surface border-4 border-ink shadow-[8px_8px_0_0_var(--color-ink)] w-full max-w-4xl max-h-[85vh] flex flex-col z-10 animate-scale-in">
        <div className="flex items-center justify-between border-b-3 border-ink px-5 py-4 bg-accent/20">
          <div>
            <h2 id="media-picker-title" className="text-lg font-black uppercase text-ink">
              {t('modalTitle')}
            </h2>
            <p className="text-xs text-ink/70">
              {t('modalSubtitle')}
            </p>
          </div>
          <Button
            type="button"
            variant="surface"
            size="sm"
            onClick={() => setOpen(false)}
            aria-label={tCommon('dismiss')}
            className="w-8 h-8 px-0 py-0"
          >
            ✕
          </Button>
        </div>

        <div className="p-4 border-b-2 border-ink bg-surface/50 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder={tShared('searchPlaceholderDefault')}
            className="w-full text-xs"
          />
          <SelectSearch
            name="source"
            options={[
              { value: 'all', label: t('filterSourceAll') },
              { value: 'products', label: t('filterSourceProducts') },
              { value: 'posts', label: t('filterSourcePosts') },
              { value: 'settings', label: t('filterSourceSettings') },
            ]}
            value={filters.source}
            onChange={(val) =>
              setFilters((f) => ({
                ...f,
                source: (val as FilterMediaOptions['source']) || 'all',
              }))
            }
            aria-label={t('filterSourceAria')}
          />
          <SelectSearch
            name="type"
            options={[
              { value: 'all', label: t('filterTypeAll') },
              { value: 'image', label: t('filterTypeImage') },
              { value: 'file', label: t('filterTypeFile') },
            ]}
            value={filters.type}
            onChange={(val) =>
              setFilters((f) => ({
                ...f,
                type: (val as FilterMediaOptions['type']) || 'all',
              }))
            }
            aria-label={t('filterTypeAria')}
          />
        </div>

        <div className="p-5 overflow-y-auto flex-1 min-h-[260px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-ink/60">
              <span className="animate-spin text-2xl">⏳</span>
              <p className="text-xs font-bold uppercase tracking-wider">
                {tShared('loadingMedia')}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
              <span className="text-4xl mb-2">📁</span>
              <p className="text-sm font-bold text-ink mb-1">{t('emptyTitle')}</p>
              <p className="text-xs text-ink/60 leading-relaxed">
                {items.length === 0
                  ? tShared('emptyMedia')
                  : tCommon('noResults')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((it) => (
                <Button
                  key={`${it.source}-${it.sourceId}-${it.url}`}
                  type="button"
                  variant="surface"
                  size="sm"
                  onClick={() => handleSelect(it.url)}
                  className="group relative p-2 text-left flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <div className="aspect-square bg-ink/5 border border-ink/30 mb-2 overflow-hidden flex items-center justify-center relative">
                    {it.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.url}
                        alt={it.filename}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">📄</span>
                    )}
                    <span className="absolute top-1 right-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-ink text-surface">
                      {it.source}
                    </span>
                  </div>

                  <p
                    className="text-xs font-bold text-ink truncate w-full"
                    title={it.filename}
                  >
                    {it.filename}
                  </p>
                  <p className="text-[10px] text-ink/60 mt-0.5">
                    {it.type}
                  </p>

                  <div className="absolute inset-0 bg-primary/90 text-surface font-bold text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('chooseMedia')}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t-2 border-ink px-5 py-3 bg-surface">
          <p className="text-xs text-ink/60 font-mono">
            {t('totalMediaCount', { count: filtered.length })}
          </p>
          <Button
            variant="surface"
            size="sm"
            type="button"
            onClick={() => setOpen(false)}
          >
            {tBtn('cancel')}
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {triggerLabel ?? tShared('pickerButton')}
      </Button>
      {mounted && typeof document !== 'undefined'
        ? createPortal(modal, document.body)
        : null}
    </>
  );
}
