'use client';

/**
 * Manage preview images of a product — show existing + add/remove via API.
 *
 * Dua cara tambah image:
 *   1. Upload file baru (form upload standard)
 *   2. "Pakai dari Library" — buka MediaPickerModal in-app dialog, pilih gambar
 *      dari library (product/post) dan tautkan URL langsung.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button, BUTTON_LABEL_CLS } from '@/components/ui/neobrutal';
import { Text } from '@/components/ui';
import { confirmDialog } from '@/components/ui/dialog-store';
import { toast } from '@/components/ui/toast-store';
import { MediaPickerModal } from '@/components/admin/MediaPickerModal';
import { getClientApiBase } from '@/lib/client-api';
import { Image } from '@/components/ui/Image';

interface Props {
  productId: number;
  initial: string[];
  apiUrl: string;
}

export function PreviewImagesManager({ productId, initial, apiUrl }: Props) {
  const t = useTranslations('admin.shared');
  const router = useRouter();
  const [images, setImages] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function addImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);

    const fd = new FormData();
    fd.append('file', file);

    startTransition(async () => {
      try {
        const res = await fetch(`${getClientApiBase()}/api/admin/products/${productId}/preview-images`, {
          method: 'POST',
          body: fd,
          credentials: 'include',
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setImages(data.data.preview_images);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : t('uploadError'));
      }
    });
  }

  async function addImageByUrl(url: string) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`${getClientApiBase()}/api/admin/products/${productId}/preview-images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
          credentials: 'include',
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setImages(data.data.preview_images);
        router.refresh();
        toast.success(t('imagePicked', { url: url.slice(0, 40) }));
      } catch (err) {
        setError(err instanceof Error ? err.message : t('uploadError'));
      }
    });
  }

  async function removeImage(index: number) {
    const ok = await confirmDialog({
      title: t('pickerConfirmTitle'),
      message: t('pickerConfirmMessage'),
      confirmLabel: t('pickerConfirmAction'),
      danger: true,
    });
    if (!ok) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`${getClientApiBase()}/api/admin/products/${productId}/preview-images`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ index }),
          credentials: 'include',
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setImages(data.data.preview_images);
        router.refresh();
        toast.success(t('imageDeleted'));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('deleteError'));
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url} className="relative border-2 border-ink bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Image
              src={url}
              alt={t('previewAlt', { n: i + 1 })}
              className="h-24 w-24"
            />
            <Button
              type="button"
              onClick={() => removeImage(i)}
              disabled={pending}
              variant="accent"
              size="sm"
              flat
              className="absolute -top-2 -right-2 h-6 w-6 min-h-0 p-0 text-xs hover:bg-primary hover:text-surface"
              aria-label={t('previewRemoveAria')}
            >
              ×
            </Button>
          </div>
        ))}
      </div>

      {images.length < 5 && (
        <div className="flex flex-wrap gap-2 items-center">
          <label className={BUTTON_LABEL_CLS + ' inline-flex items-center gap-2 bg-surface px-3 py-2 text-sm'}>
            {t('addImage')}
            <input
              type="file"
              accept="image/*"
              onChange={addImage}
              disabled={pending}
              className="hidden"
            />
          </label>
          <MediaPickerModal onPick={addImageByUrl} disabled={pending} />
        </div>
      )}

      {pending && (
        <Text>{t('processing')}</Text>
      )}
      {error && (
        <p className="text-xs font-bold text-primary">{error}</p>
      )}
    </div>
  );
}
