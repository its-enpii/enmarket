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
    if (open && !fetched) {
      startTransition(async () => {
        const data = await fetchMediaLibrary();
        setItems(data);
        setFetched(true);
      });
    }
  }, [open, fetched]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function handleSelect(url: string) {
    onPick(url);
    setOpen(false);
  }

  const filtered = filterMedia(items, filters);

  const modalJsx = open ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Dark Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Tutup modal"
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-ink/75 backdrop-blur-xs cursor-default"
      />

      {/* Modal Dialog Box */}
      <div className="relative z-10 bg-surface border-4 border-ink shadow-[12px_12px_0_0_var(--color-ink)] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-ink p-4 md:p-5 bg-surface shrink-0">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-1">
              ✎ {t('listEyebrow')}
            </p>
            <h3 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-ink">
              {t('pickerBadge')}
            </h3>
          </div>
          <Button
            type="button"
            variant="accent"
            size="sm"
            flat
            onClick={() => setOpen(false)}
            aria-label="Tutup"
          >
            ✕
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b-2 border-ink bg-surface/50 shrink-0 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              type="search"
              value={filters.q ?? ''}
              placeholder={t('searchPlaceholder')}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            />
          </div>
          <div className="w-48">
            <SelectSearch
              name="media_source_filter"
              value={filters.source ?? 'all'}
              placeholder={t('source.all')}
              options={[
                { value: 'all', label: t('source.all') },
                { value: 'product', label: t('source.product') },
                { value: 'post', label: t('source.post') },
              ]}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  source: v as 'all' | 'product' | 'post',
                }))
              }
              clearable={false}
            />
          </div>
        </div>

        {/* Content / Gallery Grid */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 min-h-[320px]">
          {loading && !fetched ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <span className="font-display text-3xl animate-bounce mb-2">⏳</span>
              <p className="font-body text-sm font-bold text-ink/70">
                Memuat media dari library…
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 border-2 border-dashed border-ink/30 bg-surface/40">
              <span className="font-display text-4xl mb-2">🖼️</span>
              <p className="font-display text-xl font-black uppercase text-ink">
                Belum Ada Gambar di Library
              </p>
              <p className="text-xs text-ink/60 mt-1 max-w-sm">
                Library media masih kosong. Upload file dari tombol &quot;Choose Files&quot; terlebih dahulu atau buat produk/post dengan gambar.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="font-display text-2xl font-black uppercase text-ink">
                {t('empty.titleMatch')}
              </p>
              <p className="text-xs text-ink/60 mt-1 max-w-sm">
                {t('empty.hintMatch')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((item, i) => (
                <button
                  key={`${item.url}-${i}`}
                  type="button"
                  onClick={() => handleSelect(item.url)}
                  className="group block text-left border-2 border-ink bg-surface hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--color-ink)] transition-all cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <div className="aspect-square bg-ink/10 border-b-2 border-ink overflow-hidden relative">
                    {item.type === 'image' || item.type === 'other' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.filename}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface text-ink">
                        <span className="font-display text-2xl">📎</span>
                      </div>
                    )}

                    <span
                      className={
                        'absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border border-ink ' +
                        (item.source === 'product'
                          ? 'bg-accent text-ink'
                          : 'bg-primary text-surface')
                      }
                    >
                      {item.source === 'product'
                        ? t('sourceBadge.product')
                        : t('sourceBadge.post')}
                    </span>
                  </div>

                  <div className="p-2">
                    <p className="font-mono text-[11px] text-ink truncate" title={item.filename}>
                      {item.filename}
                    </p>
                    <p className="font-label text-[9px] uppercase tracking-wide text-ink/60 truncate">
                      {item.sourceLabel}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-4 border-ink bg-surface flex justify-between items-center shrink-0 text-xs">
          <span className="text-ink/60 font-body">
            Klik pada gambar untuk menautkan ke produk secara langsung.
          </span>
          <Button type="button" variant="surface" size="sm" onClick={() => setOpen(false)}>
            Batal
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        ◰ {triggerLabel ?? tShared('pickerUseLibrary')}
      </Button>

      {mounted && modalJsx && createPortal(modalJsx, document.body)}
    </>
  );
}