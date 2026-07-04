/**
 * Skeleton untuk halaman checkout.
 * Match dengan layout 2-column: form (kiri) + ringkasan pesanan primary (kanan).
 */
export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:py-12 space-y-4">
      {/* Heading */}
      <div className="h-9 w-32 bg-surface border-2 border-ink animate-pulse" />
      <div className="h-4 w-64 bg-surface border-2 border-ink animate-pulse" />

      {/* Grid 2 kolom: form + summary */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-8">
        {/* Form skeleton */}
        <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] animate-pulse">
          <div className="h-5 w-32 bg-ink/10 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-3 w-24 bg-ink/10 mb-2" />
                <div className="h-12 w-full bg-ink/10 border-2 border-ink" />
              </div>
            ))}
            <div className="h-12 w-full bg-accent/50 border-2 border-ink mt-2" />
          </div>
        </div>

        {/* Summary aside primary */}
        <aside className="bg-primary/40 border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] animate-pulse h-fit">
          <div className="h-3 w-24 bg-surface/40 mb-3" />
          <div className="space-y-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-40 bg-surface/40" />
                <div className="h-3 w-16 bg-surface/40" />
              </div>
            ))}
          </div>
          <div className="border-t-2 border-surface/30 pt-3 space-y-2">
            <div className="h-3 w-12 bg-surface/40" />
            <div className="h-7 w-32 bg-surface/40" />
          </div>
        </aside>
      </div>
    </div>
  );
}
