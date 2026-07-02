/**
 * Skeleton untuk halaman pembayaran (QR + countdown).
 */
export default function PaymentLoading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8 sm:py-12">
      <div className="h-8 w-64 bg-surface border-2 border-ink animate-pulse shadow-[3px_3px_0_0_var(--color-ink)] mb-4" />
      <div className="h-4 w-48 bg-surface border-2 border-ink animate-pulse mb-6" />

      {/* QR box */}
      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] animate-pulse text-center">
        <div className="w-64 h-64 mx-auto bg-ink/10 border-2 border-ink" />
        <div className="h-6 w-32 bg-ink/10 mx-auto mt-4" />
        <div className="h-4 w-24 bg-ink/10 mx-auto mt-2" />
      </div>

      {/* Countdown + buttons */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
        <div className="h-12 bg-surface border-2 border-ink" />
        <div className="h-12 bg-surface border-2 border-ink" />
      </div>
    </div>
  );
}