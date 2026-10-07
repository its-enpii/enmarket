/**
 * Wishlist loading skeleton.
 * Mirror: max-w-6xl header (eyebrow + hero title + count) →
 * 3-col product grid (ProductGrid).
 */
export default function wishlistLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-12 animate-pulse">
      {/* Header */}
      <div className="mb-8 border-b-4 border-ink pb-6">
        <div className="h-4 w-24 bg-accent/40 mb-3" />
        <div className="h-14 w-64 max-w-full bg-ink/20" />
        <div className="mt-3 h-4 w-48 bg-ink/10" />
      </div>

      {/* Product grid — 3 kolom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden"
          >
            <div className="aspect-43 bg-primary/10 border-b-4 border-ink" />
            <div className="p-5 space-y-3">
              <div className="h-7 w-3/4 bg-ink/20" />
              <div className="h-4 w-full bg-ink/10" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-6 w-24 bg-accent/40 border-2 border-ink" />
                <div className="h-8 w-16 bg-primary/20 border-2 border-ink" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
