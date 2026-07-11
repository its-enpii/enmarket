/**
 * Skeleton untuk halaman pesanan sukses.
 * Match dengan real page: hero banner primary + order info card + items card + info box + action buttons.
 */
export default function PesananSuksesLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:py-12 animate-pulse">
      {/* Hero banner primary */}
      <div className="bg-primary text-surface border-4 border-ink p-8 shadow-[8px_8px_0_0_var(--color-ink)] text-center mb-8">
        <div className="h-3 w-40 bg-surface/40 mx-auto" />
        <div className="mt-3 h-10 w-80 bg-surface/40 mx-auto" />
        <div className="mt-4 h-4 w-full max-w-xl bg-surface/40 mx-auto" />
        <div className="mt-2 h-4 w-3/4 max-w-xl bg-surface/40 mx-auto" />
      </div>

      {/* Order info card */}
      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-ink/10" />
              <div className="h-6 w-40 bg-ink/10 mt-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Items card */}
      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] mb-6">
        <div className="h-6 w-48 bg-ink/10 mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="border-b-2 border-dashed border-ink/20 pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-2/3 bg-ink/10" />
                  <div className="h-3 w-1/3 bg-ink/10 mt-2" />
                </div>
                <div className="h-5 w-20 bg-primary/40 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info box accent */}
      <div className="bg-accent text-ink border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] mb-8">
        <div className="h-4 w-40 bg-ink/20 mb-3" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-ink/10" />
          <div className="h-3 w-full bg-ink/10" />
          <div className="h-3 w-3/4 bg-ink/10" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <div className="h-12 w-48 bg-primary border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]" />
        <div className="h-12 w-48 bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]" />
      </div>
    </div>
  );
}