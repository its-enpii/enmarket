/**
 * Skeleton loader untuk halaman pembayaran.
 *
 * Match real page layout (mx-auto max-w-4xl px-6 py-8 sm:py-12):
 *   1. Back link (h-4 w-20 bg-ink/10 mb-4)
 *   2. Heading block (h1 + subtext)
 *   3. PaymentPoller content:
 *      - Countdown box (bg-accent)
 *      - 2-col grid: LEFT QR card | RIGHT info column (info + button + link)
 *      - Footer note
 */

export default function PembayaranLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:py-12 animate-pulse">
      {/* 1. Back link */}
      <div className="h-4 w-20 bg-ink/10 mb-4" />

      {/* 2. Heading block */}
      <div className="h-8 w-48 bg-ink/15 mb-2" />
      <div className="h-4 w-72 bg-ink/10 mb-8" />

      {/* 3. PaymentPoller content */}
      <div className="space-y-6">
        {/* Countdown box */}
        <div className="bg-accent text-ink border-2 border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)] text-center">
          <div className="h-3 w-24 bg-ink/30 mx-auto" />
          <div className="h-12 sm:h-14 w-40 bg-ink/30 mx-auto mt-2 font-mono" />
        </div>

        {/* 2-col grid: QR | info column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT — QR card */}
          <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)]">
            <div className="h-3 w-20 bg-ink/10 mx-auto mb-3" />
            <div className="aspect-square bg-ink/10 border-2 border-ink" />
            <div className="h-3 w-3/4 bg-ink/10 mx-auto mt-3" />
          </div>

          {/* RIGHT — info column */}
          <div className="space-y-4">
            {/* Info card */}
            <div className="bg-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)]">
              <div className="h-3 w-20 bg-ink/10" />
              <div className="h-6 w-40 bg-ink/15 mt-1 font-mono" />
              <div className="h-3 w-12 bg-ink/10 mt-3" />
              <div className="h-9 w-32 bg-primary/40 mt-1" />
            </div>

            {/* Manual check button */}
            <div className="h-12 w-full bg-surface border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]" />

            {/* Link */}
            <div className="h-3 w-40 bg-ink/10 mx-auto" />
          </div>
        </div>

        {/* Footer note */}
        <div className="h-3 w-56 bg-ink/10 mx-auto text-center" />
      </div>
    </div>
  );
}