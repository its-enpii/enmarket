/**
 * Skeleton untuk halaman detail order admin.
 */
export default function OrderDetailLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <header className="border-b-4 border-ink pb-6">
        <div className="h-3 w-28 bg-accent/40 mb-3" />
        <div className="h-12 sm:h-16 w-2/3 bg-ink/15 mb-3" />
        <div className="h-4 w-3/4 bg-ink/10 max-w-2xl border-l-4 border-accent pl-4" />
      </header>

      {/* Quick info + actions card skeleton */}
      <div className="bg-surface border-2 border-ink p-4 flex flex-wrap items-center gap-3 shadow-[3px_3px_0_0_var(--color-ink)]">
        <div className="h-7 w-24 bg-accent/50 border-2 border-ink" />
        <div className="h-4 w-32 bg-ink/15" />
        <div className="h-4 w-20 bg-ink/15" />
        <div className="ml-auto flex flex-wrap gap-2">
          <div className="h-9 w-40 bg-primary border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]" />
          <div className="h-9 w-32 bg-surface border-2 border-ink" />
        </div>
      </div>

      {/* Buyer card skeleton */}
      <div className="bg-surface border-2 border-ink p-6 md:p-8 shadow-[4px_4px_0_0_var(--color-ink)]">
        <div className="border-b-2 border-ink pb-3 mb-5">
          <div className="h-2 w-20 bg-accent/40" />
          <div className="h-5 w-32 bg-ink/15 mt-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-3 w-12 bg-ink/10" />
              <div className="h-4 w-40 bg-ink/15 mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Items table skeleton */}
      <div className="bg-surface border-2 border-ink overflow-hidden shadow-[4px_4px_0_0_var(--color-ink)]">
        <div className="px-6 py-4 border-b-2 border-ink bg-primary text-surface">
          <div className="h-2 w-20 bg-accent/40 mb-1" />
          <div className="h-5 w-32 bg-surface/40 mt-1" />
        </div>
        <div className="bg-surface/50 flex px-4 py-3 gap-4 border-b-2 border-ink/30">
          <div className="h-3 w-16 bg-ink/10" />
          <div className="h-3 w-10 bg-ink/10" />
          <div className="h-3 w-12 bg-ink/10" />
          <div className="h-3 w-20 bg-ink/10" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="px-4 py-3 border-b border-ink/20 last:border-b-0">
            <div className="flex items-start gap-4">
              <div className="h-7 w-32 bg-primary border-2 border-ink shadow-[2px_2px_0_0_var(--color-ink)]" />
              <div className="h-3 w-16 bg-ink/10" />
              <div className="h-4 w-24 bg-ink/15" />
              <div className="space-y-2">
                <div className="h-5 w-28 bg-accent/50 border-2 border-ink" />
                <div className="h-3 w-32 bg-ink/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
