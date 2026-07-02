'use client';

/**
 * Manage preview images of a product — show existing + add/remove via API.
 * Pakai native fetch dengan manual token (sebab client component tidak punya
 * cookie otomatis seperti server fetch).
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

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

  async function getTokenCookie(): Promise<string | null> {
    // Cookie admin_token httpOnly — JS tidak bisa baca langsung.
    // Pakai endpoint /api/admin/me sebagai probe via fetch; kalau gagal,
    // kita tetap bisa pakai Authorization header yang diset server lain kali.
    // Untuk client ini, kita andalkan route handler khusus yang akan dibuat.
    return null;
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
    if (!confirm('Hapus preview image ini?')) return;
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal hapus');
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
        <label className="inline-flex items-center gap-2 bg-surface border-2 border-ink px-3 py-2 text-sm font-bold cursor-pointer shadow-[3px_3px_0_0_var(--color-ink)] hover:bg-accent hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-ink)] transition-all">
          + Tambah Preview
          <input
            type="file"
            accept="image/*"
            onChange={addImage}
            disabled={pending}
            className="hidden"
          />
        </label>
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
