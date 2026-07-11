/**
 * Develop — skeleton loader (matches page.tsx section structure).
 *
 * 4 sections: Header → Filter pills + search → Zigzag grid (DevelopGrid) → Footer teaser.
 * Self-contained, no imports, animate-pulse at root.
 */

export default function DevelopLoading() {
  return (
    <div className="animate-pulse">
      {/* ───── 1. HEADER ───── */}
      <section className="border-b-4 border-ink">
        <div className="px-6 md:px-12 py-20 md:py-28">
          {/* eyebrow */}
          <div className="h-3 w-32 bg-accent/40 mb-6" />
          {/* h1 */}
          <div className="h-20 sm:h-28 md:h-32 w-3/5 bg-ink/15" />
          {/* body italic */}
          <div className="h-5 w-2/3 mt-8 bg-ink/10 max-w-2xl border-l-4 border-accent pl-6" />
        </div>
      </section>

      {/* ───── 2. FILTER PILLS (left) + SEARCH (right) ───── */}
      <section className="border-b-4 border-ink bg-surface">
        <div className="px-6 md:px-12 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Filter pills (left) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-3 w-14 bg-ink/10 mr-2" />
            <div className="h-10 w-20 bg-ink border-2 border-ink shadow-[3px_3px_0_0_var(--color-accent)]" />
            <div className="h-10 w-20 bg-surface border-2 border-ink" />
            <div className="h-10 w-20 bg-surface border-2 border-ink" />
            <div className="h-10 w-20 bg-surface border-2 border-ink" />
            <div className="h-3 w-24 bg-ink/10 ml-2" />
          </div>

          {/* Search bar (right) */}
          <div className="w-full lg:w-80 lg:shrink-0 h-10 bg-ink/15 border-2 border-ink" />
        </div>
      </section>

      {/* ───── 3. ZIGZAG GRID (mirrors DevelopGrid pattern: 7/5 alternating + DividerQuote) ───── */}
      <section className="border-b-4 border-ink">
        <div className="px-6 md:px-12 py-12 md:py-16 space-y-12">
          {/* Item 1 — large (image left 7, text right 5) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 aspect-video bg-primary/10 border-2 border-ink" />
            <div className="md:col-span-5 p-4 md:p-6 space-y-3">
              <div className="h-3 w-20 bg-accent/40" />
              <div className="h-6 w-3/4 bg-ink/15" />
              <div className="h-6 w-1/2 bg-ink/15" />
              <div className="h-3 w-full bg-ink/10" />
              <div className="h-3 w-5/6 bg-ink/10" />
              <div className="h-3 w-24 bg-ink/10 mt-2" />
            </div>
          </div>

          {/* Item 2 — small flipped (image right 5, text left 7) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 order-first md:order-2 aspect-square bg-primary/10 border-2 border-ink" />
            <div className="md:col-span-7 order-2 md:order-1 p-4 md:p-6 space-y-3">
              <div className="h-3 w-20 bg-accent/40" />
              <div className="h-6 w-3/4 bg-ink/15" />
              <div className="h-6 w-1/2 bg-ink/15" />
              <div className="h-3 w-full bg-ink/10" />
              <div className="h-3 w-5/6 bg-ink/10" />
              <div className="h-3 w-24 bg-ink/10 mt-2" />
            </div>
          </div>

          {/* Divider quote (matches DividerQuote component) */}
          <div className="bg-primary border-4 border-ink shadow-[8px_8px_0_0_var(--color-ink)] p-10 md:p-16 -rotate-[0.5deg]">
            <div className="h-3 w-12 bg-accent/40 mb-4" />
            <div className="h-10 md:h-14 w-3/4 bg-accent/50" />
            <div className="h-10 md:h-14 w-1/2 bg-accent/50 mt-4" />
          </div>

          {/* Item 3 — large (image left 7, text right 5) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 aspect-video bg-primary/10 border-2 border-ink" />
            <div className="md:col-span-5 p-4 md:p-6 space-y-3">
              <div className="h-3 w-20 bg-accent/40" />
              <div className="h-6 w-3/4 bg-ink/15" />
              <div className="h-6 w-1/2 bg-ink/15" />
              <div className="h-3 w-full bg-ink/10" />
              <div className="h-3 w-5/6 bg-ink/10" />
              <div className="h-3 w-24 bg-ink/10 mt-2" />
            </div>
          </div>

          {/* Item 4 — small flipped (image right 5, text left 7) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 order-first md:order-2 aspect-square bg-primary/10 border-2 border-ink" />
            <div className="md:col-span-7 order-2 md:order-1 p-4 md:p-6 space-y-3">
              <div className="h-3 w-20 bg-accent/40" />
              <div className="h-6 w-3/4 bg-ink/15" />
              <div className="h-6 w-1/2 bg-ink/15" />
              <div className="h-3 w-full bg-ink/10" />
              <div className="h-3 w-5/6 bg-ink/10" />
              <div className="h-3 w-24 bg-ink/10 mt-2" />
            </div>
          </div>
        </div>
      </section>

      {/* ───── 4. FOOTER TEASER (bg-primary, text-surface) ───── */}
      <section className="bg-primary text-surface">
        <div className="px-6 md:px-12 py-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* left — heading block */}
          <div className="space-y-3">
            {/* eyebrow */}
            <div className="h-3 w-32 bg-accent/40 mb-3" />
            {/* h2 line 1 */}
            <div className="h-12 w-3/4 bg-surface/30" />
            {/* h2 line 2 */}
            <div className="h-12 w-1/2 bg-surface/40" />
          </div>

          {/* right — link */}
          <div className="h-10 w-48 bg-accent/50 border-2 border-surface shadow-[4px_4px_0_0_var(--color-accent)]" />
        </div>
      </section>
    </div>
  );
}