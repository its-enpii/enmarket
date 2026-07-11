/**
 * Dialog store — global Confirm/Alert modal emitter.
 *
 * Usage:
 *   import { confirmDialog, alertDialog } from '@/components/ui/dialog-store';
 *   const ok = await confirmDialog({ title: 'Hapus?', message: '...', danger: true });
 *   if (!ok) return;
 *   await alertDialog({ title: 'Berhasil', message: 'Tersimpan' });
 */

interface BaseDialogOpts {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Danger variant = red/accent confirm button */
  danger?: boolean;
}

interface ConfirmOpts extends BaseDialogOpts {
  /** default: 'Konfirmasi' */
  confirmLabel?: string;
}

interface AlertOpts extends BaseDialogOpts {
  /** default: 'OK' */
  confirmLabel?: string;
}

type DialogState =
  | { kind: 'none' }
  | {
      kind: 'confirm';
      opts: ConfirmOpts;
      resolve: (v: boolean) => void;
    }
  | {
      kind: 'alert';
      opts: AlertOpts;
      resolve: () => void;
    };

let state: DialogState = { kind: 'none' };
const subscribers = new Set<() => void>();

function set(next: DialogState) {
  state = next;
  for (const s of subscribers) s();
}

function notify() {
  for (const s of subscribers) s();
}

// Module-level constant untuk server snapshot — reference stabil agar
// useSyncExternalStore tidak mendeteksi perubahan tiap render.
// Object literal baru tiap call bikin React loop.
const NONE_STATE: DialogState = { kind: 'none' };

export const dialogStore = {
  getSnapshot: (): DialogState => state,
  getServerSnapshot: (): DialogState => NONE_STATE,
  subscribe(cb: () => void): () => void {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  },
  /** Reset state ke 'none'. Dipakai setelah dialog close. */
  reset(): void {
    set({ kind: 'none' });
  },
};

export function confirmDialog(opts: ConfirmOpts): Promise<boolean> {
  return new Promise((resolve) => {
    set({ kind: 'confirm', opts, resolve });
  });
}

export function alertDialog(opts: AlertOpts): Promise<void> {
  return new Promise((resolve) => {
    set({ kind: 'alert', opts, resolve });
  });
}

export type { ConfirmOpts, AlertOpts, DialogState };