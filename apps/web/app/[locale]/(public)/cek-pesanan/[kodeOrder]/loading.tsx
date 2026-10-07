/**
 * Cek pesanan detail loading skeleton.
 * Mirror: back link → header status pesanan + kode → status card (badge) →
 * 2-col grid: KIRI daftar item pesanan, KANAN summary pembayaran + countdown.
 */
export default function kodeOrderLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:py-12 animate-pulse">
      {/* Back + header */}
      <div className="h-4 w-32 bg-ink/10 mb-4" />
      <div className="h-8 w-64 max-w-full bg-ink/20 mb-2" />
      <div className="h-4 w-40 bg-ink/10 mb-6" />

      {/* Status card + badge */}
      <div className="bg-surface border-2 border-ink p-4 mb-6 shadow-[4px_4px_0_0_var(--color-ink)]">
        <div className="h-3 w-20 bg-ink/15 mb-2" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-28 bg-accent/40 border-2 border-ink" />
          <div className="h-4 w-32 bg-ink/10" />
        </div>
      </div>

      {/* 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] gap-6">
        {/* KIRI — daftar item pesanan */}
        <div className="bg-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] space-y-4">
          <div className="h-5 w-32 bg-ink/20" />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="border-b-2 border-dashed border-ink/20 pb-3 last:border-b-0 last:pb-0 space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-ink/20" />
                  <div className="h-3 w-24 bg-ink/10" />
                </div>
                <div className="h-5 w-20 bg-primary/20 shrink-0" />
              </div>
              <div className="h-8 w-32 bg-accent/30 border-2 border-ink" />
            </div>
          ))}
        </div>

        {/* KANAN — summary pembayaran + countdown */}
        <aside className="space-y-6">
          <div className="bg-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] space-y-3">
            <div className="h-3 w-24 bg-ink/15" />
            <div className="flex items-baseline justify-between border-b border-ink/10 pb-2">
              <div className="h-4 w-20 bg-ink/10" />
              <div className="h-5 w-24 bg-ink/20" />
            </div>
            <div className="h-6 w-32 bg-primary/20" />
          </div>
          <div className="bg-primary/20 border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] space-y-3">
            <div className="h-3 w-28 bg-surface/40" />
            <div className="h-8 w-24 bg-surface/40 border-2 border-ink" />
            <div className="h-4 w-full bg-surface/30" />
          </div>
        </aside>
      </div>
    </div>
  );
}
