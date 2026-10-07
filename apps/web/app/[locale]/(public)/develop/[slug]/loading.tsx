/**
 * Develop detail (product) loading skeleton.
 * Mirror: breadcrumb → 2-col hero (KIRI image aspect-43, KANAN title +
 * chips + price badge + Buy + trust) → details/specs checklist section.
 */
export default function developSlugLoading() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb bar */}
      <div className="bg-surface border-b-2 border-ink/20">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-6">
          <div className="h-4 w-44 bg-ink/15" />
        </div>
      </div>

      {/* Hero — 2 kolom 3fr/2fr */}
      <section className="bg-surface border-b-4 border-ink">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-16 items-center">
          {/* KIRI — thumbnail/preview */}
          <div className="border-4 border-ink bg-surface shadow-[10px_10px_0_0_var(--color-ink)] overflow-hidden">
            <div className="w-full aspect-43 bg-primary/10" />
          </div>

          {/* KANAN — title + chips + price + buy + specs checklist */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              <div className="h-7 w-24 bg-accent/40 border-2 border-ink" />
              <div className="h-7 w-20 bg-primary/20 border-2 border-ink" />
              <div className="h-7 w-16 bg-ink/15 border-2 border-ink" />
            </div>
            <div className="space-y-3">
              <div className="h-12 w-full bg-ink/20" />
              <div className="h-12 w-2/3 bg-ink/20" />
            </div>
            <div className="h-5 w-full max-w-md bg-ink/10 border-l-4 border-accent pl-4" />
            <div className="h-9 w-40 bg-accent/40 border-2 border-ink" />
            <div className="h-14 w-56 bg-primary/20 border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]" />
            {/* specs checklist */}
            <div className="space-y-2 pt-2 border-t-2 border-ink/10">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-accent/40 border-2 border-ink shrink-0" />
                  <div className="h-4 w-40 bg-ink/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Details/specs grid */}
      <section className="bg-surface">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-16 md:py-24">
          <div className="h-4 w-24 bg-accent/40 mb-4" />
          <div className="h-10 w-64 bg-ink/20 mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-surface border-2 border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)] space-y-3">
                <div className="h-3 w-20 bg-ink/15" />
                <div className="h-5 w-3/4 bg-ink/20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
