'use client';

import { Button } from '@/components/ui/neobrutal';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary. Dipanggil kalau ada unhandled error di root layout
 * atau route segment yang tidak punya error.tsx sendiri.
 */
export default function GlobalError({ error, reset }: Props) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24 text-center">
      <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-primary">
        500 — Terjadi Kesalahan
      </p>
      <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight text-ink">
        Waduh, ada yang error.
      </h1>
      <p className="mt-4 text-base text-ink/70">
        Tim kami sudah dapat notifikasi. Silakan coba lagi atau kembali ke beranda.
      </p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-4 text-xs text-left bg-ink/5 p-3 border border-ink/20 overflow-x-auto font-mono max-w-xl mx-auto">
          {error.message}
          {error.digest && `\nDigest: ${error.digest}`}
        </pre>
      )}
      <div className="mt-8 flex flex-wrap gap-3 items-center justify-center">
        <Button variant="accent" size="md" type="button" onClick={reset}>
          Coba Lagi
        </Button>
        <Button variant="surface" size="md" href="/">
          Beranda
        </Button>
      </div>
    </div>
  );
}