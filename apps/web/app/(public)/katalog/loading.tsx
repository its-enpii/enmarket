/**
 * Skeleton loading untuk halaman katalog.
 * Match dengan real page: heading + SearchBar + CategoryFilter sidebar + product grid + pagination.
 */
export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-12">
      {/* Heading */}
      <div className="mb-8">
        <div className="h-9 w-32 bg-surface border-2 border-ink animate-pulse" />
        <div className="mt-3 h-4 w-64 bg-surface border-2 border-ink animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-6">
        {/* Sidebar: search + category chips */}
        <div className="space-y-4">
          <div className="h-10 bg-surface border-2 border-ink animate-pulse" />
          <div className="bg-surface border-2 border-ink p-3 shadow-[3px_3px_0_0_var(--color-ink)] animate-pulse space-y-2">
            <div className="h-3 w-16 bg-ink/10 mb-2" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-full bg-ink/10" />
            ))}
          </div>
        </div>

        {/* Products grid + pagination */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] animate-pulse"
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
          {/* Pagination skeleton */}
          <div className="flex gap-2 justify-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-10 bg-ink/10 border-2 border-ink"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}