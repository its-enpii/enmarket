/**
 * Skeleton untuk Display Detail page — editorial long-form article.
 * Match real layout: breadcrumb, cover, title + byline, article body,
 * tags, reaction strip, related notes.
 */
export default function DisplayDetailLoading() {
  const SC = 'mx-auto max-w-screen-2xl px-6 md:px-12';
  return (
    <div className="animate-pulse">
      {/* ───── 1. BREADCRUMB ───── */}
      <div className="bg-surface border-b-2 border-ink/20">
        <div className={`${SC} py-4`}>
          <div className="h-4 w-32 bg-ink/10" />
        </div>
      </div>

      {/* ───── 2. COVER ───── */}
      <section className="border-b-4 border-ink bg-surface">
        <div className={`${SC} py-8 md:py-12`}>
          <div className="relative">
            <div className="bg-surface border-4 border-ink shadow-[12px_12px_0_0_var(--color-ink)] overflow-hidden -rotate-1">
              <div className="w-full aspect-[16/9] bg-primary/10" />
            </div>
          </div>
        </div>
      </section>

      {/* ───── 3. TITLE + BYLINE ───── */}
      <section className="border-b-4 border-ink">
        <div className={`${SC} py-12 md:py-16`}>
          <div className="h-3 w-24 bg-accent/40 mb-6" />
          <div className="space-y-3 max-w-5xl">
            <div className="h-16 w-full bg-ink/15" />
            <div className="h-16 w-4/5 bg-ink/15" />
            <div className="h-16 w-3/5 bg-ink/15" />
          </div>
          <div className="mt-8 h-6 w-3/4 bg-ink/10 max-w-3xl border-l-4 border-accent pl-6" />
          <div className="mt-10 inline-flex flex-wrap items-center gap-x-5 gap-y-2 border-2 border-ink bg-surface px-5 py-3 shadow-[3px_3px_0_0_var(--color-ink)]">
            <div className="h-6 w-20 bg-accent/50 border-2 border-ink" />
            <div className="h-4 w-24 bg-ink/10" />
            <div className="h-4 w-2 bg-ink/10" />
            <div className="h-4 w-28 bg-ink/10" />
            <div className="h-4 w-32 bg-ink/15" />
          </div>
        </div>
      </section>

      {/* ───── 4. ARTICLE BODY ───── */}
      <section className="border-b-4 border-ink bg-surface">
        <div className={`${SC} py-12 md:py-20`}>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-4 w-full bg-ink/10" />
            <div className="h-4 w-11/12 bg-ink/10" />
            <div className="h-4 w-10/12 bg-ink/10" />
            <div className="h-4 w-full bg-ink/10" />
            <div className="h-12 w-3/4 bg-accent/40 my-6 border-l-8 border-accent pl-6" />
            <div className="h-4 w-full bg-ink/10" />
            <div className="h-4 w-11/12 bg-ink/10" />
            <div className="h-4 w-10/12 bg-ink/10" />
            <div className="mt-16 h-3 w-40 bg-ink/10" />
          </div>
        </div>
      </section>

      {/* ───── 5. TAGS ───── */}
      <section className="border-b-4 border-ink bg-surface">
        <div className={`${SC} py-8 md:py-10`}>
          <div className="max-w-3xl mx-auto">
            <div className="h-3 w-28 bg-ink/10 mb-4" />
            <div className="flex flex-wrap gap-2">
              <div className="h-8 w-20 bg-accent/50 border-2 border-ink" />
              <div className="h-8 w-24 bg-ink/15 border-2 border-ink" />
              <div className="h-8 w-24 bg-ink/15 border-2 border-ink" />
            </div>
          </div>
        </div>
      </section>

      {/* ───── 6. REACTION STRIP ───── */}
      <section className="border-b-4 border-ink bg-surface">
        <div className={`${SC} py-10 md:py-12`}>
          <div className="max-w-3xl mx-auto">
            <div className="h-3 w-32 bg-ink/15 mb-4" />
            <div className="flex gap-3">
              <div className="h-12 w-20 bg-surface border-2 border-ink shadow-[2px_2px_0_0_var(--color-ink)]" />
              <div className="h-12 w-20 bg-surface border-2 border-ink shadow-[2px_2px_0_0_var(--color-ink)]" />
            </div>
          </div>
        </div>
      </section>

      {/* ───── 7. RELATED NOTES ───── */}
      <section className="border-t-4 border-ink bg-surface">
        <div className={`${SC} py-12 md:py-16`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="h-3 w-32 bg-accent/40 mb-3" />
              <div className="h-12 sm:h-14 w-2/3 bg-ink/15" />
            </div>
            <div className="h-4 w-32 bg-ink/15" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]"
              >
                <div className="aspect-square bg-primary/10 border-b-2 border-ink" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-20 bg-accent/50" />
                  <div className="h-5 w-full bg-ink/15" />
                  <div className="h-5 w-3/4 bg-ink/15" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — bg-primary section */}
      <section className="bg-primary text-surface animate-pulse">
        <div className={`${SC} py-12 md:py-16 text-center`}>
          <div className="h-3 w-40 bg-accent/40 mx-auto mb-4" />
          <div className="space-y-3 mb-6 max-w-3xl mx-auto">
            <div className="h-10 w-3/4 mx-auto bg-surface/30" />
            <div className="h-10 w-1/2 mx-auto bg-accent/40" />
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="h-12 w-48 bg-surface border-4 border-ink shadow-[6px_6px_0_0_var(--color-accent)]" />
            <div className="h-12 w-56 bg-transparent border-4 border-surface" />
          </div>
        </div>
      </section>
    </div>
  );
}