/**
 * Discover — skeleton loader (matches page.tsx section structure).
 *
 * 5 sections: Hero → Story 2-col → Pillars 3-block → Process/values stamp row → CTA footer.
 * Self-contained, no imports, animate-pulse at root.
 */

export default function DiscoverLoading() {
  const SC = 'mx-auto max-w-screen-2xl px-6 md:px-12';
  return (
    <div className="animate-pulse">
      {/* ───── 1. HERO ───── */}
      <section className="border-b-4 border-ink">
        <div className={`${SC} py-20 md:py-28`}>
          {/* eyebrow */}
          <div className="h-3 w-32 bg-accent/40 mb-6" />
          {/* h1 */}
          <div className="h-20 sm:h-28 md:h-32 w-3/5 bg-ink/15" />
          {/* body italic */}
          <div className="h-5 w-2/3 mt-8 bg-ink/10 max-w-2xl border-l-4 border-accent pl-6" />
        </div>
      </section>

      {/* ───── 2. STORY (asymmetric 2-col) ───── */}
      <section className="border-b-4 border-ink bg-surface">
        <div className={`${SC} py-20 md:py-28 grid grid-cols-1 lg:grid-cols-[5fr_4fr] gap-10 lg:gap-16 items-start`}>
          {/* Left — pull-quote column */}
          <div className="space-y-6">
            <div className="h-12 w-full bg-primary/40" />
            <div className="h-12 w-full bg-ink/15" />
            <div className="h-12 w-4/5 bg-accent/50" />
            <div className="h-12 w-3/4 bg-ink/15" />
          </div>

          {/* Right — narrative column */}
          <div className="space-y-6 lg:pt-4">
            {/* paragraph 1 */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-ink/10" />
              <div className="h-4 w-11/12 bg-ink/10" />
              <div className="h-4 w-10/12 bg-ink/10" />
            </div>
            {/* paragraph 2 */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-ink/10" />
              <div className="h-4 w-11/12 bg-ink/10" />
              <div className="h-4 w-10/12 bg-ink/10" />
            </div>
            {/* paragraph 3 */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-ink/10" />
              <div className="h-4 w-11/12 bg-ink/10" />
              <div className="h-4 w-10/12 bg-ink/10" />
            </div>
            {/* paragraph 4 (shorter) */}
            <div className="space-y-2">
              <div className="h-4 w-11/12 bg-ink/10" />
              <div className="h-4 w-3/4 bg-ink/10" />
            </div>
            {/* signature */}
            <div className="h-3 w-40 bg-accent/40 mt-2" />
          </div>
        </div>
      </section>

      {/* ───── 3. PILLARS (3-block side by side) ───── */}
      <section className="border-b-4 border-ink">
        <div className={`${SC} py-16 md:py-20`}>
          {/* heading row */}
          <div className="mb-12 max-w-2xl">
            <div className="h-3 w-24 bg-accent/40 mb-3" />
            <div className="h-12 sm:h-16 w-3/4 bg-ink/15" />
          </div>

          {/* 3-block grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-4 border-ink shadow-[8px_8px_0_0_var(--color-ink)]">
            {/* pillar 1 — primary icon bg */}
            <article className="bg-surface p-8 md:p-10 flex flex-col gap-5 border-t-4 border-ink md:border-t-0 md:border-l-4">
              <div className="w-16 h-16 border-4 border-ink shadow-[4px_4px_0_0_var(--color-ink)] bg-primary" />
              <div className="h-10 w-32 bg-ink/15" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-ink/10" />
                <div className="h-4 w-11/12 bg-ink/10" />
                <div className="h-4 w-3/4 bg-ink/10" />
              </div>
            </article>

            {/* pillar 2 — accent icon bg (no left border because middle gets it) */}
            <article className="bg-surface p-8 md:p-10 flex flex-col gap-5 border-t-4 border-ink md:border-t-0 md:border-l-4">
              <div className="w-16 h-16 border-4 border-ink shadow-[4px_4px_0_0_var(--color-ink)] bg-accent" />
              <div className="h-10 w-32 bg-ink/15" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-ink/10" />
                <div className="h-4 w-11/12 bg-ink/10" />
                <div className="h-4 w-3/4 bg-ink/10" />
              </div>
            </article>

            {/* pillar 3 — ink icon bg */}
            <article className="bg-surface p-8 md:p-10 flex flex-col gap-5 border-t-4 border-ink md:border-t-0 md:border-l-4">
              <div className="w-16 h-16 border-4 border-ink shadow-[4px_4px_0_0_var(--color-ink)] bg-ink" />
              <div className="h-10 w-32 bg-ink/15" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-ink/10" />
                <div className="h-4 w-11/12 bg-ink/10" />
                <div className="h-4 w-3/4 bg-ink/10" />
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ───── 4. PROCESS/VALUES (horizontal stamp row on dark bg) ───── */}
      <section className="border-b-4 border-ink bg-ink">
        <div className={`${SC} py-14 md:py-16`}>
          {/* heading row */}
          <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-8 mb-8">
            <div className="h-3 w-32 bg-accent/40" />
            <div className="h-4 w-2/3 bg-surface/40 max-w-xl" />
          </div>

          {/* 7 stamp pills */}
          <ul className="flex flex-wrap gap-3">
            {/* 4 accent pills */}
            <li className="h-10 w-24 bg-accent/50 border-2 border-surface shadow-[3px_3px_0_0_var(--color-accent)]" />
            <li className="h-10 w-24 bg-accent/50 border-2 border-surface shadow-[3px_3px_0_0_var(--color-accent)]" />
            <li className="h-10 w-24 bg-accent/50 border-2 border-surface shadow-[3px_3px_0_0_var(--color-accent)]" />
            <li className="h-10 w-24 bg-accent/50 border-2 border-surface shadow-[3px_3px_0_0_var(--color-accent)]" />
            {/* 3 primary pills */}
            <li className="h-10 w-32 bg-primary/50 border-2 border-surface shadow-[3px_3px_0_0_var(--color-accent)]" />
            <li className="h-10 w-32 bg-primary/50 border-2 border-surface shadow-[3px_3px_0_0_var(--color-accent)]" />
            <li className="h-10 w-32 bg-primary/50 border-2 border-surface shadow-[3px_3px_0_0_var(--color-accent)]" />
          </ul>
        </div>
      </section>

      {/* ───── 5. CTA FOOTER (bg-accent) ───── */}
      <section className="bg-accent border-b-4 border-ink">
        <div className={`${SC} py-24 md:py-32 text-center`}>
          {/* eyebrow */}
          <div className="h-3 w-24 bg-ink/30 mx-auto mb-6" />
          {/* h2 line 1 */}
          <div className="h-14 w-3/4 bg-ink/20 mx-auto mb-2" />
          {/* h2 line 2 */}
          <div className="h-14 w-1/2 bg-ink/30 mx-auto mb-10" />
          {/* body */}
          <div className="h-5 w-2/3 bg-ink/20 max-w-2xl mx-auto mb-12" />
          {/* 2 CTAs centered */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <div className="h-12 w-44 bg-primary border-2 border-ink shadow-[4px_4px_0_0_var(--color-accent)]" />
            <div className="h-4 w-32 bg-ink/20" />
          </div>
        </div>
      </section>
    </div>
  );
}
