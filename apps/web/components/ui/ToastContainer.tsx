'use client';

import { useSyncExternalStore } from 'react';

import { toast, toastStore, type Toast } from './toast-store';

/**
 * Toast container — render semua active toasts fixed di top-right.
 * Mount sekali di root layout.
 */
export function ToastContainer() {
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getServerSnapshot,
  );

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(calc(100vw-2rem),22rem)] pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

const VARIANT_BG: Record<Toast['variant'], string> = {
  success: 'bg-accent text-ink',
  error: 'bg-primary text-surface',
  info: 'bg-ink text-surface',
};

const VARIANT_ICON: Record<Toast['variant'], string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

function ToastItem({ toast: t }: { toast: Toast }) {
  return (
    <div
      role={t.variant === 'error' ? 'alert' : 'status'}
      className={
        'pointer-events-auto border-2 border-ink px-4 py-3 shadow-[4px_4px_0_0_var(--color-ink)] ' +
        'flex items-start gap-3 ' +
        VARIANT_BG[t.variant]
      }
    >
      <span aria-hidden="true" className="font-bold text-lg shrink-0">
        {VARIANT_ICON[t.variant]}
      </span>
      <p className="flex-1 text-sm font-bold leading-snug break-words">
        {t.message}
      </p>
      <button
        type="button"
        onClick={() => toast.dismiss(t.id)}
        aria-label="Dismiss"
        className="shrink-0 w-7 h-7 inline-flex items-center justify-center font-bold opacity-80 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}