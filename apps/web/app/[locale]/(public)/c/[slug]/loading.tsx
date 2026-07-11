/**
 * Skeleton untuk /c/[slug] alias page.
 * Real page melakukan redirect ke /katalog?category=... — skeleton tetap
 * render placeholder agar tidak flash kosong saat menunggu redirect.
 */
export default function CategoryAliasLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 md:px-12 py-8 sm:py-12 animate-pulse">
      <div className="mb-8">
        <div className="h-9 w-32 bg-surface border-2 border-ink" />
        <div className="mt-3 h-4 w-64 bg-surface border-2 border-ink" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-6">
        {/* Sidebar skeleton */}
        <div className="space-y-4">
          <div className="h-10 bg-surface border-2 border-ink" />
          <div className="bg-surface border-2 border-ink p-3 shadow-[3px_3px_0_0_var(--color-ink)] space-y-2">
            <div className="h-3 w-16 bg-ink/10 mb-2" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-full bg-ink/10" />
            ))}
          </div>
        </div>

        {/* Products grid skeleton */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]"
              >
                <div className="aspect-video bg-primary/10 border-b-2 border-ink" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 bg-ink/10" />
                  <div className="h-3 w-1/2 bg-ink/10" />
                  <div className="h-6 w-1/3 bg-ink/10 mt-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}