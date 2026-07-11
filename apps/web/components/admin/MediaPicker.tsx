'use client';

/**
 * MediaPicker — buka /admin/media?pick=1 di popup window untuk pilih image
 * dari library. Return URL via postMessage ke opener.
 *
 * Use case: di form produk, user klik "Pilih dari library" → buka picker →
 * click image → window close + form field terisi dengan URL.
 *
 * Catatan: window.open() pattern sederhana. Alternatif: modal dalam-app
 * (lebih mulus, tapi lebih banyak code). Untuk MVP cukup popup.
 *
 * Callback: kalau ada callback di-window opener, panggil. Atau default
 * fallback ke postMessage listener yang disimpan di window.__mediaPickHandler.
 */

import { useCallback } from 'react';

import { Button } from '@/components/ui/neobrutal';

interface Props {
  /** Label tombol. Default: "Pilih dari Library". */
  label?: string;
  /** Variant button. Default: 'surface'. */
  variant?: 'surface' | 'primary' | 'accent';
  /** Size button. Default: 'sm'. */
  size?: 'sm' | 'md';
  /**
   * Dipanggil saat user memilih image dari library.
   * `url` adalah URL image yang dipilih.
   */
  onPick: (url: string) => void;
}

export function MediaPicker({
  label = 'Pilih dari Library',
  variant = 'surface',
  size = 'sm',
  onPick,
}: Props) {
  const handleClick = useCallback(() => {
    // Register handler di window supaya window picker bisa panggil.
    // Pakai symbol key biar tidak conflict dengan listener lain.
    (window as unknown as { __mediaPickHandler?: (url: string) => void }).__mediaPickHandler = onPick;

    // Buka picker di popup window.
    const url = '/admin/media?pick=1';
    const features = 'width=900,height=700,menubar=no,toolbar=no,location=no';
    window.open(url, 'media-picker', features);
  }, [onPick]);

  return (
    <Button variant={variant} size={size} type="button" onClick={handleClick}>
      ◰ {label}
    </Button>
  );
}

/**
 * Listener yang dipasang di /admin/media?pick=1 — menerima postMessage
 * dari parent (kalau MediaPicker dibuka dari form dalam window yang sama).
 * Untuk popup-window pattern, MediaGallery handle sendiri via window.opener.
 *
 * Function ini di-export terpisah untuk integrasi dengan form yang mau
 * pakai library dalam same-window (bukan popup).
 */
export function attachMediaPickListener(handler: (url: string) => void): () => void {
  function listener(event: MessageEvent) {
    if (event.origin !== window.location.origin) return;
    const data = event.data as { type?: string; url?: string } | null;
    if (data?.type === 'media-pick' && typeof data.url === 'string') {
      handler(data.url);
    }
  }
  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}