/**
 * Skeleton untuk halaman pembayaran (QR + countdown).
 * Match dengan real page: back link + heading + QR box + action buttons.
 */
export default function PaymentLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:py-12 space-y-6">
      {/* Back link */}
      <div className="h-4 w-20 bg-ink/10 animate-pulse" />

      {/* Heading */}
      <div>
        <div className="h-8 w-48 bg-surface border-2 border-ink animate-pulse" />
        <div className="mt-2 h-4 w-72 bg-ink/10 animate-pulse" />
      </div>

      {/* QR box */}
      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] animate-pulse text-center">
        <div className="w-64 h-64 mx-auto bg-ink/10 border-2 border-ink" />
        <div className="h-6 w-32 bg-ink/10 mx-auto mt-4" />
        <div className="h-4 w-24 bg-ink/10 mx-auto mt-2" />
      </div>

      {/* Countdown + buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
        <div className="h-12 bg-surface border-2 border-ink" />
        <div className="h-12 bg-surface border-2 border-ink" />
      </div>
    </div>
  );
}
