/**
 * Skeleton untuk halaman detail cek pesanan publik.
 * Match dengan layout: link back + heading + status banner + order info + items.
 */
export default function CheckOrderDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:py-12 space-y-6">
      {/* Back link */}
      <div className="h-4 w-32 bg-ink/10 animate-pulse" />

      {/* Heading */}
      <div>
        <div className="h-8 w-48 bg-surface border-2 border-ink animate-pulse" />
        <div className="mt-2 h-4 w-64 bg-ink/10 animate-pulse" />
      </div>

      {/* Status banner (status poller placeholder) */}
      <div className="bg-surface/60 border-2 border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)] animate-pulse">
        <div className="h-3 w-16 bg-ink/10 mb-2" />
        <div className="h-8 w-40 bg-ink/10" />
        <div className="mt-2 h-3 w-64 bg-ink/10" />
      </div>

      {/* Order info box */}
      <div className="bg-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-3 w-12 bg-ink/10 mb-1" />
              <div className="h-4 w-32 bg-ink/10 mt-0.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Items box */}
      <div className="bg-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] animate-pulse">
        <div className="h-5 w-24 bg-ink/10 mb-3" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="border-b-2 border-dashed border-ink/20 pb-3 last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-ink/10" />
                  <div className="h-3 w-20 bg-ink/10 mt-1" />
                </div>
                <div className="h-4 w-20 bg-ink/10" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action hint (pending only — optional di skeleton, render red block placeholder) */}
      <div className="bg-primary/40 border-2 border-ink h-12 shadow-[4px_4px_0_0_var(--color-ink)] animate-pulse" />
    </div>
  );
}
