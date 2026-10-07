/**
 * Discover loading skeleton.
 * Mirror: PageHeader (eyebrow + h1 + subtitle) → tag filter chips bar →
 * search & filter bar → 3-column product grid (6 cards).
 */
export default function discoverLoading() {
  return (
    <div className="animate-pulse">
      {/* Header — mirror PageHeader */}
      <section className="border-b-4 border-ink">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-20 md:py-28">
          <div className="h-4 w-32 bg-accent/40 mb-6" />
          <div className="h-14 w-96 max-w-full bg-ink/20" />
          <div className="mt-8 h-6 w-full max-w-2xl bg-ink/10 border-l-4 border-accent pl-6" />
        </div>
      </section>

      {/* Tag chips + search/filter bar */}
      <section className="bg-surface border-b-4 border-ink">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-4 w-16 bg-ink/15" />
            {['w-16', 'w-20', 'w-16', 'w-24', 'w-14'].map((w, i) => (
              <div
                key={i}
                className={`h-8 border-2 border-ink ${w} ${i % 2 === 0 ? 'bg-accent/30' : 'bg-primary/20'}`}
              />
            ))}
          </div>
          <div className="w-full lg:w-80 lg:shrink-0 h-11 bg-ink/10 border-2 border-ink" />
        </div>
      </section>

      {/* Product grid — 3 kolom, 6 kartu */}
      <section className="bg-surface">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden"
              >
                <div className="aspect-43 bg-primary/10 border-b-4 border-ink" />
                <div className="p-5 space-y-3">
                  <div className="h-7 w-3/4 bg-ink/20" />
                  <div className="h-4 w-full bg-ink/10" />
                  <div className="h-4 w-2/3 bg-ink/10" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-6 w-24 bg-accent/40 border-2 border-ink" />
                    <div className="h-8 w-20 bg-primary/20 border-2 border-ink" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
