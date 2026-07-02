'use client';

import Link from 'next/link';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary untuk route group (public). Wrap dengan TopNav + Footer
 * styling minimal — fallback ke background surface + text ink.
 */
export default function PublicError({ error, reset }: Props) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24 text-center">
      <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-primary">
        500 — Terjadi Kesalahan
      </p>
      <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight text-ink">
        Waduh, ada yang error.
      </h1>
      <p className="mt-4 text-base text-ink/70">
        Coba lagi sebentar, atau kembali ke katalog.
      </p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-4 text-xs text-left bg-ink/5 p-3 border border-ink/20 overflow-x-auto font-mono max-w-xl mx-auto">
          {error.message}
        </pre>
      )}
      <div className="mt-8 flex flex-wrap gap-3 items-center justify-center">
        <button
          type="button"
          onClick={reset}
          className="border-2 border-ink bg-accent text-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_var(--color-ink)] transition-all min-h-[44px]"
        >
          Coba Lagi
        </button>
        <Link
          href="/katalog"
          className="inline-block border-2 border-ink bg-surface text-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_var(--color-ink)] transition-all min-h-[44px]"
        >
          Lihat Katalog
        </Link>
      </div>
    </div>
  );
}