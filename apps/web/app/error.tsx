'use client';

import { Button } from '@/components/ui/neobrutal';
import { ErrorState } from '@/components/ui/ErrorState';

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
    <ErrorState
      className="mx-auto max-w-2xl px-6 py-16 sm:py-24 text-center"
      titleClassName="mt-3 text-4xl sm:text-5xl font-bold leading-tight text-ink"
      eyebrow="500 — Terjadi Kesalahan"
      title="Waduh, ada yang error."
      description="Tim kami sudah dapat notifikasi. Silakan coba lagi atau kembali ke beranda."
      actions={
        <div className="flex flex-wrap gap-3 items-center justify-center">
          <Button variant="accent" size="md" type="button" onClick={reset}>
            Coba Lagi
          </Button>
          <Button variant="surface" size="md" href="/">
            Beranda
          </Button>
        </div>
      }
    >
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-4 text-xs text-left bg-ink/5 p-3 border border-ink/20 overflow-x-auto font-mono max-w-xl mx-auto">
          {error.message}
          {error.digest && `\nDigest: ${error.digest}`}
        </pre>
      )}
    </ErrorState>
  );
}
