/**
 * Toast store — module-level emitter + subscriber list.
 * Pattern: imperatif API (toast.success/error) + React subscription via useSyncExternalStore.
 *
 * PENTING: getSnapshot return **copy array** tiap kali dipanggil.
 * useSyncExternalStore cache snapshot pakai Object.is — kalau return
 * reference yang sama tiap call, React bail out dan tidak detect perubahan.
 *
 * Catatan: kalau return [...toasts] setiap render dan component
 * re-render setiap subscribe fire, bisa terjadi infinite loop.
 * Solusi: track lastSeen version, return cached snapshot kecuali
 * array berubah.
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
let toasts: Toast[] = [];
let lastSnapshot: Toast[] = [];
const subscribers = new Set<() => void>();

function notify() {
  for (const s of subscribers) s();
}

function snapshot(): Toast[] {
  // Buat snapshot baru hanya kalau array backing storage berubah.
  // Bandingkan length + reference identity cukup untuk detect.
  if (lastSnapshot.length !== toasts.length || lastSnapshot === toasts) {
    lastSnapshot = [...toasts];
  }
  return lastSnapshot;
}

// Module-level constant untuk server snapshot — harus reference stabil
// agar useSyncExternalStore tidak mendeteksi perubahan tiap render.
// Kalau return array literal `[]` tiap call, React akan loop.
// Di-freeze supaya tidak dimutasi tidak sengaja (cast balik ke mutable
// supaya tetap kompatibel dengan tipe Toast[] di component).
const EMPTY_TOASTS: Toast[] = Object.freeze([]) as unknown as Toast[];

export const toastStore = {
  getSnapshot: snapshot,
  getServerSnapshot: (): Toast[] => EMPTY_TOASTS,
  subscribe(cb: () => void): () => void {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  },
};

function push(message: string, variant: ToastVariant, duration = 4000): number {
  const id = nextId++;
  // Replace backing array reference (immutable update).
  toasts = [...toasts, { id, message, variant, duration }];
  notify();
  return id;
}

function dismiss(id: number) {
  const next = toasts.filter((t) => t.id !== id);
  if (next.length === toasts.length) return; // not found
  toasts = next;
  notify();
}

export const toast = {
  success: (message: string, duration?: number) => push(message, 'success', duration),
  error: (message: string, duration?: number) => push(message, 'error', duration ?? 6000),
  info: (message: string, duration?: number) => push(message, 'info', duration),
  dismiss,
};