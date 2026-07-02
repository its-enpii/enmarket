/**
 * Skeleton loading untuk halaman katalog.
 * Ditampilkan saat Server Component fetch berlangsung.
 */
export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-12">
      <div className="mb-8">
        <div className="h-10 w-48 bg-surface border-2 border-ink animate-pulse shadow-[3px_3px_0_0_var(--color-ink)]" />
        <div className="mt-3 h-4 w-64 bg-surface border-2 border-ink animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-6">
        <div className="space-y-4">
          <div className="h-10 bg-surface border-2 border-ink animate-pulse shadow-[3px_3px_0_0_var(--color-ink)]" />
          <div className="h-64 bg-surface border-2 border-ink animate-pulse shadow-[3px_3px_0_0_var(--color-ink)]" />
        </div>

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
      </div>
    </div>
  );
}