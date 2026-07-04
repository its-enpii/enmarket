'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState, useTransition } from 'react';

interface AdminListCtx {
  pending: boolean;
  startTransition: (cb: () => void) => void;
}

const Ctx = createContext<AdminListCtx | null>(null);

/** Minimum berapa ms skeleton harus terlihat. Mencegah flicker
 *  saat RSC fetch selesai < 50ms (skeleton flash terlalu cepat → tidak kelihatan).
 *  Default 200ms cukup untuk user lihat "ini loading", tidak terasa lambat. */
const MIN_SKELETON_MS = 200;

/**
 * Provider yang share useTransition state antara LiveFilterBar (pemanggil
 * router.replace) dan DataTableArea (consumer skeleton).
 *
 * Penting: kalau pending flip true→false dalam <MIN_SKELETON_MS (misal
 * categories filter client-side super cepat), skeleton tetap tampil
 * hingga MIN_SKELETON_MS lewat — agar user lihat feedback visual.
 *
 * Wrap seluruh area list (AdminTableHeader + DataTable + Pagination).
 * Kalau dipanggil di luar Provider, fallback ke startTransition synchronous
 * (no pending state, tapi tidak crash).
 */
export function AdminListProvider({ children }: { children: React.ReactNode }) {
  const [pending, startTransition] = useTransition();
  const [delayedPending, setDelayedPending] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Cleanup semua timer saat unmount atau dep berubah
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    if (pending) {
      // Pending baru → tampilkan skeleton setelah microtask (next paint)
      showTimer.current = setTimeout(() => {
        setDelayedPending(true);
        // Schedule hide setelah MIN_SKELETON_MS
        hideTimer.current = setTimeout(() => {
          setDelayedPending(false);
        }, MIN_SKELETON_MS);
      }, 0);
    } else {
      // Pending false → hide segera (kalau sedang tampil, langsung hide)
      setDelayedPending(false);
    }

    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pending]);

  const value = useMemo(
    () => ({ pending: delayedPending, startTransition }),
    [delayedPending],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminList(): AdminListCtx {
  const ctx = useContext(Ctx);
  if (!ctx) return { pending: false, startTransition: (cb) => cb() };
  return ctx;
}