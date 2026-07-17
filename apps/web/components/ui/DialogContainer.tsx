'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/neobrutal';

import { dialogStore, type DialogState } from './dialog-store';

/**
 * Dialog container — render Confirm/Alert modal global.
 * Mount sekali di root layout. Trap focus + Escape to close.
 */
export function DialogContainer() {
  const state = useSyncExternalStore(
    dialogStore.subscribe,
    dialogStore.getSnapshot,
    dialogStore.getServerSnapshot,
  );

  if (state.kind === 'none') return null;

  return <Modal state={state} />;
}

function Modal({ state }: { state: DialogState }) {
  const isConfirm = state.kind === 'confirm';
  const opts = isConfirm ? state.opts : (state as Extract<DialogState, { kind: 'alert' }>).opts;
  const danger = isConfirm ? opts.danger : false;
  const confirmLabel = opts.confirmLabel ?? (isConfirm ? 'Konfirmasi' : 'OK');
  const cancelLabel = opts.cancelLabel ?? 'Batal';

  function close(result: boolean | 'cancel') {
    if (state.kind === 'confirm') {
      state.resolve(result === true);
    } else if (state.kind === 'alert') {
      if (result === true) state.resolve();
    }
    dialogStore.reset();
  }

  // Escape close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close('cancel');
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog"
        onClick={() => close('cancel')}
        className="absolute inset-0 bg-ink/60 cursor-default"
      />

      {/* Panel */}
      <div className="relative bg-surface border-2 border-ink shadow-[6px_6px_0_0_var(--color-ink)] w-full max-w-md p-6">
        <h2 id="dialog-title" className="text-lg font-bold text-ink mb-2">
          {opts.title}
        </h2>
        <p className="text-sm text-ink/80 mb-6 whitespace-pre-line">{opts.message}</p>

        <div className="flex flex-wrap gap-2 justify-end">
          {isConfirm && (
            <Button
              variant="surface"
              size="sm"
              type="button"
              onClick={() => close('cancel')}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            variant={danger ? 'primary' : 'accent'}
            size="sm"
            type="button"
            autoFocus
            onClick={() => close(true)}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
