/**
 * Skeleton untuk halaman keranjang.
 */
export default function CartLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:py-12">
      <div className="h-10 w-48 bg-surface border-2 border-ink animate-pulse shadow-[3px_3px_0_0_var(--color-ink)] mb-6" />

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)] animate-pulse flex gap-4"
          >
            <div className="w-24 h-24 bg-ink/10 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-2/3 bg-ink/10" />
              <div className="h-3 w-1/3 bg-ink/10" />
              <div className="h-8 w-24 bg-ink/10 mt-3" />
            </div>
            <div className="h-6 w-20 bg-ink/10" />
          </div>
        ))}
      </div>

      {/* Summary skeleton */}
      <div className="mt-6 bg-surface border-2 border-ink p-6 shadow-[3px_3px_0_0_var(--color-ink)] animate-pulse">
        <div className="h-5 w-32 bg-ink/10 mb-3" />
        <div className="h-8 w-48 bg-ink/10" />
        <div className="h-12 w-full bg-ink/10 mt-4" />
      </div>
    </div>
  );
}