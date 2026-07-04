/**
 * Skeleton untuk beranda publik.
 * Match dengan real page (Hero + Kategori chips + Featured grid + Latest grid).
 */
export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-12 space-y-12 animate-pulse">
      {/* Hero skeleton — primary-colored block dengan ukuran yang match */}
      <section className="bg-primary/40 border-4 border-ink p-8 sm:p-12 shadow-[8px_8px_0_0_var(--color-ink)] space-y-4">
        <div className="h-3 w-40 bg-surface/40" />
        <div className="h-12 sm:h-16 w-3/4 bg-surface/40" />
        <div className="h-12 sm:h-16 w-1/2 bg-surface/40" />
        <div className="mt-4 h-5 w-2/3 bg-surface/40" />
        <div className="mt-6 sm:mt-8 flex gap-3">
          <div className="h-12 w-40 bg-surface/40" />
          <div className="h-12 w-44 bg-surface/40" />
        </div>
      </section>

      {/* Kategori chips skeleton */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-2">
          <div className="h-8 w-32 bg-surface border-2 border-ink" />
          <div className="h-5 w-24 bg-surface border-2 border-ink" />
        </div>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border-2 border-ink h-10 w-24 shadow-[3px_3px_0_0_var(--color-ink)]"
            />
          ))}
        </div>
      </section>

      {/* Featured grid skeleton */}
      <section id="unggulan">
        <div className="mb-6 flex items-end justify-between gap-2">
          <div className="h-8 w-64 bg-surface border-2 border-ink" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]"
            >
              <div className="aspect-video bg-ink/10 border-b-2 border-ink" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-ink/15" />
                <div className="h-3 w-1/2 bg-ink/15" />
                <div className="h-6 w-1/3 bg-ink/15 mt-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest grid skeleton */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-2">
          <div className="h-8 w-32 bg-surface border-2 border-ink" />
          <div className="h-5 w-28 bg-surface border-2 border-ink" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]"
            >
              <div className="aspect-video bg-ink/10 border-b-2 border-ink" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-ink/15" />
                <div className="h-3 w-1/2 bg-ink/15" />
                <div className="h-6 w-1/3 bg-ink/15 mt-3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
