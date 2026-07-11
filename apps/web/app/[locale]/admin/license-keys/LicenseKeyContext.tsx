'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface LicenseKeyCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const Ctx = createContext<LicenseKeyCtx | null>(null);

/**
 * Provider untuk LicenseKeyForm state. Wrap seluruh area License Keys
 * page (header + filter bar + table). Trigger button di action slot
 * filter bar + form Card di secondary slot keduanya baca/tulis ke
 * context yang sama → state konsisten.
 */
export function LicenseKeyProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLicenseKey(): LicenseKeyCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error('useLicenseKey must be used within LicenseKeyProvider');
  }
  return ctx;
}