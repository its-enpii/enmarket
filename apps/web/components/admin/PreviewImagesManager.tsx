'use client';

/**
 * Manage preview images of a product — show existing + add/remove via API.
 *
 * Dua cara tambah image:
 *   1. Upload file baru (form upload standard)
 *   2. "Pakai dari Library" — buka /admin/media?pick=1 popup, pilih existing
 *      image dari library, return via postMessage.
 *
 * Backend attach-by-reference belum ada — tombol "Pakai dari Library"
 * sementara kasih toast "Coming soon" sampai backend support POST with URL.
 */

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { BUTTON_LABEL_CLS } from '@/components/ui/neobrutal';
import { confirmDialog } from '@/components/ui/dialog-store';
import { toast } from '@/components/ui/toast-store';

interface Props {
  productId: number;
  initial: string[];
  apiUrl: string;
}

export function PreviewImagesManager({ productId, initial, apiUrl }: Props) {
  const router = useRouter();
  const [images, setImages] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Listen postMessage dari MediaPicker popup window.
  useEffect(() => {
    function listener(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; url?: string } | null;
      if (data?.type === 'media-pick' && typeof data.url === 'string') {
        // Backend belum support attach-by-URL — kasih feedback visual dulu.
        toast.info(
          `Dipilih: ${data.url.slice(0, 60)}… — backend attach-by-URL coming soon. Untuk sekarang upload manual.`,
        );
      }
    }
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, []);

  function openLibrary() {
    window.open('/admin/media?pick=1', 'media-picker', 'width=900,height=700');
  }

  async function addImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);

    const fd = new FormData();
    fd.append('file', file);

    startTransition(async () => {
      try {
        const res = await fetch(`${apiUrl}/api/admin/products/${productId}/preview-images`, {
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
        setError(err instanceof Error ? err.message : 'Gagal upload');
      }
    });
  }

  async function removeImage(index: number) {
    const ok = await confirmDialog({
      title: 'Hapus Preview Image',
      message: 'Hapus preview image ini?',
      confirmLabel: 'Hapus',
      danger: true,
    });
    if (!ok) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`${apiUrl}/api/admin/products/${productId}/preview-images`, {
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
        toast.success('Image dihapus.');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Gagal hapus');
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url} className="relative border-2 border-ink bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Preview ${i + 1}`}
              className="h-24 w-24 object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              disabled={pending}
              className="absolute -top-2 -right-2 h-6 w-6 bg-accent border-2 border-ink text-xs font-bold shadow-[2px_2px_0_0_var(--color-ink)] hover:bg-primary hover:text-surface disabled:opacity-50"
              aria-label="Hapus"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {images.length < 5 && (
        <div className="flex flex-wrap gap-2">
          <label className={BUTTON_LABEL_CLS + ' inline-flex items-center gap-2 bg-surface px-3 py-2 text-sm'}>
            + Upload Baru
            <input
              type="file"
              accept="image/*"
              onChange={addImage}
              disabled={pending}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={openLibrary}
            disabled={pending}
            className={BUTTON_LABEL_CLS + ' inline-flex items-center gap-2 bg-accent px-3 py-2 text-sm'}
          >
            ◰ Pakai dari Library
          </button>
        </div>
      )}

      {pending && (
        <p className="text-xs text-ink/60">Memproses…</p>
      )}
      {error && (
        <p className="text-xs font-bold text-primary">{error}</p>
      )}
    </div>
  );
}
