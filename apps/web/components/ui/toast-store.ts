/**
 * Toast store — module-level emitter + subscriber list.
 * Pattern: imperatif API (toast.success/error) + React subscription via useSyncExternalStore.
 *
 * Usage:
 *   import { toast } from '@/components/ui/toast';
 *   toast.success('Disimpan');
 *   toast.error('Gagal');
 *   toast.info('Info');
 */

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number; // ms, 0 = sticky
}

let nextId = 1;
const toasts: Toast[] = [];
const subscribers = new Set<() => void>();

function notify() {
  for (const s of subscribers) s();
}

export const toastStore = {
  getSnapshot: (): Toast[] => toasts,
  getServerSnapshot: (): Toast[] => [],
  subscribe(cb: () => void): () => void {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  },
};

function push(message: string, variant: ToastVariant, duration = 4000): number {
  const id = nextId++;
  toasts.push({ id, message, variant, duration });
  notify();
  if (duration > 0) {
    setTimeout(() => {
      const i = toasts.findIndex((t) => t.id === id);
      if (i >= 0) {
        toasts.splice(i, 1);
        notify();
      }
    }, duration);
  }
  return id;
}

function dismiss(id: number) {
  const i = toasts.findIndex((t) => t.id === id);
  if (i >= 0) {
    toasts.splice(i, 1);
    notify();
  }
}

export const toast = {
  success: (message: string, duration?: number) => push(message, 'success', duration),
  error: (message: string, duration?: number) => push(message, 'error', duration ?? 6000),
  info: (message: string, duration?: number) => push(message, 'info', duration),
  dismiss,
};