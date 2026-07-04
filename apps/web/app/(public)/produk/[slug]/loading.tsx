/**
 * Skeleton untuk halaman detail produk publik.
 * Match dengan real layout:
 *   - breadcrumb
 *   - 2-col grid (gallery + info panel: badge + title + price + chips + add-to-cart + fitur)
 *   - deskripsi box
 *   - meta info 4-col
 */
export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-12 space-y-12 animate-pulse">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <div className="h-3 w-14 bg-ink/10" />
        <span className="text-ink/40">/</span>
        <div className="h-3 w-12 bg-ink/10" />
        <span className="text-ink/40">/</span>
        <div className="h-3 w-20 bg-ink/10" />
        <span className="text-ink/40">/</span>
        <div className="h-3 w-40 bg-ink/10" />
      </nav>

      {/* 2-col grid: gallery + info panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery skeleton */}
        <div className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden">
          <div className="aspect-video bg-primary/10 border-b-2 border-ink" />
          <div className="p-3 flex gap-2 border-t-2 border-ink/0">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-16 h-16 bg-ink/10 border-2 border-ink/30"
              />
            ))}
          </div>
        </div>

        {/* Info panel skeleton */}
        <div className="space-y-5">
          {/* Featured badge */}
          <div className="h-5 w-20 bg-accent/40 border-2 border-ink" />

          {/* Title */}
          <div className="space-y-2">
            <div className="h-10 w-3/4 bg-surface border-2 border-ink" />
            <div className="h-10 w-1/2 bg-surface border-2 border-ink" />
          </div>

          {/* Price */}
          <div className="h-12 w-48 bg-primary/30 border-2 border-ink" />

          {/* Chips row */}
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-24 bg-ink border-2 border-ink" />
            <div className="h-6 w-28 bg-primary border-2 border-ink" />
            <div className="h-6 w-24 bg-accent border-2 border-ink" />
          </div>

          {/* Add to cart button block */}
          <div className="h-14 w-full bg-primary border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]" />

          {/* Fitur list skeleton (4 item) */}
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-surface border-2 border-ink px-3 py-3 flex gap-2"
              >
                <div className="h-4 w-4 bg-ink/10 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-full bg-ink/10" />
                  <div className="h-3 w-3/4 bg-ink/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deskripsi box */}
      <div>
        <div className="h-7 w-48 bg-surface border-2 border-ink mb-4" />
        <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] space-y-3">
          <div className="h-4 w-full bg-ink/10" />
          <div className="h-4 w-11/12 bg-ink/10" />
          <div className="h-4 w-10/12 bg-ink/10" />
          <div className="h-4 w-9/12 bg-ink/10" />
        </div>
      </div>

      {/* Meta info 4-col */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface border-2 border-ink p-3 shadow-[2px_2px_0_0_var(--color-ink)]"
          >
            <div className="h-2 w-12 bg-ink/10" />
            <div className="mt-1 h-4 w-20 bg-ink/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
