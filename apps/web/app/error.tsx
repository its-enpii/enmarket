'use client';

import { Button } from '@/components/ui/neobrutal';
import { ErrorState } from '@/components/ui/ErrorState';
import { ErrorDigest } from '@/components/ui';

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
        <ErrorDigest>
          {error.message}
          {error.digest && `\nDigest: ${error.digest}`}
        </ErrorDigest>
      )}
    </ErrorState>
  );
}
