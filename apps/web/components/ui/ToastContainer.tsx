'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

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
      className="fixed top-20 right-4 z-[100] flex flex-col gap-2 w-[min(calc(100vw-2rem),22rem)] pointer-events-none"
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
  const [exiting, setExiting] = useState(false);

  // Auto-dismiss dengan animasi exit.
  useEffect(() => {
    if (t.duration <= 0) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setExiting(true);
      // Animasi exit 200ms sebelum hapus dari store.
      setTimeout(() => {
        if (!cancelled) toast.dismiss(t.id);
      }, 200);
    }, t.duration);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [t.id, t.duration]);

  return (
    <div
      role={t.variant === 'error' ? 'alert' : 'status'}
      className={
        'pointer-events-auto border-2 border-ink px-4 py-3 shadow-[4px_4px_0_0_var(--color-ink)] ' +
        'flex items-start gap-3 transition-all duration-200 ' +
        (exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0') +
        ' ' +
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
        onClick={() => {
          setExiting(true);
          setTimeout(() => toast.dismiss(t.id), 200);
        }}
        aria-label="Dismiss"
        className="shrink-0 min-w-[44px] min-h-[44px] w-11 h-11 inline-flex items-center justify-center font-bold opacity-80 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}