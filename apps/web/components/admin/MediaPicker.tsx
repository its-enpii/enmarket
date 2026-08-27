'use client';

/**
 * MediaPicker — wrapper component yang merender MediaPickerModal in-app dialog.
 */

import { MediaPickerModal } from './MediaPickerModal';

interface Props {
  /** Label tombol. Default: "Pakai dari Library". */
  label?: string;
  /** Variant button. Default: 'surface'. */
  variant?: 'surface' | 'primary' | 'accent';
  /** Size button. Default: 'sm'. */
  size?: 'sm' | 'md';
  /** Dipanggil saat user memilih image dari library. */
  onPick: (url: string) => void;
  disabled?: boolean;
}

export function MediaPicker({
  label,
  variant = 'surface',
  onPick,
  disabled = false,
}: Props) {
  return (
    <MediaPickerModal
      triggerLabel={label}
      variant={variant}
      onPick={onPick}
      disabled={disabled}
    />
  );
}

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