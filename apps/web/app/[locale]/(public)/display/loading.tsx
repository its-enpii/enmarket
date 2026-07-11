/**
 * Skeleton untuk Display index page — editorial zine listing.
 * Match real layout: header, tag pills + search, featured cover,
 * asymmetric post grid, footer teaser.
 */
export default function DisplayListLoading() {
  return (
    <div className="animate-pulse">
      {/* ───── 1. HEADER ───── */}
      <section className="border-b-4 border-ink">
        <div className="px-6 md:px-12 py-20 md:py-28">
          <div className="h-3 w-32 bg-accent/40 mb-6" />
          <div className="h-20 sm:h-28 md:h-32 w-2/5 bg-ink/15" />
          <div className="mt-8 h-5 w-2/3 bg-ink/10 max-w-2xl border-l-4 border-accent pl-6" />
        </div>
      </section>

      {/* ───── 2. TAG PILLS + SEARCH ───── */}
      <section className="border-b-4 border-ink bg-surface">
        <div className="px-6 md:px-12 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-3 w-16 bg-ink/10 mr-2" />
            <div className="h-8 w-24 bg-accent/50 border-2 border-ink" />
            <div className="h-8 w-24 bg-primary/50 border-2 border-ink" />
            <div className="h-8 w-24 bg-accent/50 border-2 border-ink" />
            <div className="h-8 w-24 bg-primary/50 border-2 border-ink" />
            <div className="h-3 w-28 bg-ink/10 ml-2" />
          </div>

          <div className="w-full lg:w-80 lg:shrink-0 h-10 bg-ink/15 border-2 border-ink" />
        </div>
      </section>

      {/* ───── 3. FEATURED POST COVER ───── */}
      <section className="border-b-4 border-ink bg-surface">
        <div className="px-6 md:px-12 py-12 md:py-16">
          <div className="bg-surface border-4 border-ink shadow-[12px_12px_0_0_var(--color-ink)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 bg-primary/10 border-b-4 lg:border-b-0 lg:border-r-4 border-ink">
              <div className="w-full aspect-[4/3] lg:aspect-auto lg:min-h-[400px] bg-primary/20" />
            </div>
            <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col gap-5 bg-surface">
              <div className="h-3 w-32 bg-ink/10" />
              <div className="h-12 sm:h-14 w-3/4 bg-ink/15" />
              <div className="h-12 sm:h-14 w-1/2 bg-ink/15" />
              <div className="h-4 w-full bg-ink/10" />
              <div className="h-4 w-5/6 bg-ink/10 border-l-4 border-accent pl-4" />
              <div className="h-5 w-32 bg-primary/40 mt-2" />
            </div>
          </div>
        </div>
      </section>

      {/* ───── 4. ASYMMETRIC POST GRID ───── */}
      <section className="border-b-4 border-ink">
        <div className="px-6 md:px-12 py-12 md:py-16">
          <div className="space-y-10">
            {/* Row 1 — wide */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 aspect-[2/1] bg-primary/10 border-2 border-ink" />
              <div className="lg:col-span-5 p-4 md:p-6 space-y-3">
                <div className="h-5 w-20 bg-accent/50 border-2 border-ink" />
                <div className="h-6 w-3/4 bg-ink/15" />
                <div className="h-6 w-1/2 bg-ink/15" />
                <div className="h-4 w-full bg-ink/10" />
                <div className="h-4 w-5/6 bg-ink/10" />
                <div className="h-3 w-24 bg-ink/10 mt-2" />
              </div>
            </div>

            {/* Row 2 — square */}
            <div className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 aspect-square bg-primary/10 border-2 border-ink" />
              <div className="md:col-span-5 p-4 md:p-6 space-y-3">
                <div className="h-5 w-20 bg-accent/50 border-2 border-ink" />
                <div className="h-6 w-3/4 bg-ink/15" />
                <div className="h-6 w-1/2 bg-ink/15" />
                <div className="h-4 w-full bg-ink/10" />
                <div className="h-4 w-5/6 bg-ink/10" />
                <div className="h-3 w-24 bg-ink/10 mt-2" />
              </div>
            </div>

            {/* Row 3 — narrow (flipped) */}
            <div className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 p-4 md:p-6 space-y-3">
                <div className="h-5 w-20 bg-accent/50 border-2 border-ink" />
                <div className="h-6 w-3/4 bg-ink/15" />
                <div className="h-6 w-1/2 bg-ink/15" />
                <div className="h-4 w-full bg-ink/10" />
                <div className="h-4 w-5/6 bg-ink/10" />
                <div className="h-3 w-24 bg-ink/10 mt-2" />
              </div>
              <div className="md:col-span-7 aspect-square bg-primary/10 border-2 border-ink" />
            </div>
          </div>
        </div>
      </section>

      {/* ───── 5. FOOTER TEASER ───── */}
      <section className="bg-primary text-surface">
        <div className="px-6 md:px-12 py-16 md:py-20 text-center">
          <div className="h-3 w-56 bg-accent/40 mx-auto mb-4" />
          <div className="h-12 w-3/4 bg-surface/30 mx-auto" />
          <div className="h-12 w-1/2 bg-accent/30 mx-auto mb-6" />
          <div className="h-4 w-2/3 bg-surface/30 max-w-xl mx-auto mb-8" />
          <div className="h-12 w-52 mx-auto bg-surface border-4 border-ink shadow-[6px_6px_0_0_var(--color-accent)]" />
        </div>
      </section>
    </div>
  );
}