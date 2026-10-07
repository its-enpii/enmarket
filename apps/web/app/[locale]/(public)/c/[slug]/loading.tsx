/**
 * Category alias (/c/[slug] → /develop) loading skeleton.
 * Mirror: header kategori → 2-col layout (sidebar filter w-64 + 3-col grid).
 */
export default function categorySlugLoading() {
  return (
    <div className="animate-pulse">
      {/* Header kategori */}
      <section className="border-b-4 border-ink">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-20 md:py-28">
          <div className="h-4 w-28 bg-accent/40 mb-6" />
          <div className="h-14 w-80 max-w-full bg-ink/20" />
          <div className="mt-8 h-6 w-full max-w-2xl bg-ink/10 border-l-4 border-accent pl-6" />
        </div>
      </section>

      {/* Body — sidebar + grid */}
      <section className="bg-surface">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)] gap-8 lg:gap-10 items-start">
          {/* Sidebar filter w-64 */}
          <aside className="w-full lg:w-64 bg-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] space-y-5">
            <div className="h-4 w-24 bg-ink/15 border-b-2 border-ink pb-3" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 bg-ink/10" />
                {[0, 1].map((j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-ink/10 border-2 border-ink" />
                    <div className="h-4 w-24 bg-ink/10" />
                  </div>
                ))}
              </div>
            ))}
          </aside>

          {/* Grid produk 3 kolom */}
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
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-6 w-24 bg-accent/40 border-2 border-ink" />
                    <div className="h-8 w-16 bg-primary/20 border-2 border-ink" />
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
