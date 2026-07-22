/**
 * Skeleton untuk Work Detail page — portfolio case study layout.
 * Match dengan real layout:
 *   - breadcrumb
 *   - hero 2-col (image + info panel: chips + title + price + CTA)
 *   - About asymmetric 2-col
 *   - Details checklist grid
 *   - Gallery irregular grid
 *   - Related works 3-col
 *
 * Pakai mx-auto max-w-screen-2xl + px-6 md:px-12 inline (bukan
 * SectionContainer) supaya loading.tsx tetap zero-dependency — tidak
 * ada import cycle, dan skeleton-nya tidak butuh i18n namespace.
 */
export default function WorkDetailLoading() {
  const SC = 'mx-auto max-w-screen-2xl px-6 md:px-12';
  return (
    <div className="animate-pulse">
      {/* Breadcrumb */}
      <div className="border-b-2 border-ink/10">
        <div className={`${SC} py-4`}>
          <div className="h-4 w-32 bg-ink/10" />
        </div>
      </div>

      {/* Hero 2-col */}
      <div className="border-b-4 border-ink">
        <div className={`${SC} py-16 md:py-24 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10`}>
          <div className="bg-surface border-4 border-ink shadow-[10px_10px_0_0_var(--color-ink)] -rotate-1">
            <div className="w-full aspect-[4/3] bg-primary/10" />
          </div>
          <div className="space-y-5">
            <div className="flex gap-2">
              <div className="h-7 w-28 bg-accent/40 border-2 border-ink" />
              <div className="h-7 w-20 bg-ink/40 border-2 border-ink" />
            </div>
            <div className="space-y-3">
              <div className="h-14 w-full bg-ink/10" />
              <div className="h-14 w-3/4 bg-ink/10" />
            </div>
            <div className="h-5 w-full bg-ink/10" />
            <div className="h-12 w-44 bg-accent/40 border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]" />
            <div className="h-12 w-full bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]" />
          </div>
        </div>
      </div>

      {/* About 2-col */}
      <div className="border-b-4 border-ink">
        <div className={`${SC} py-16 md:py-24 grid grid-cols-1 lg:grid-cols-[5fr_4fr] gap-10`}>
          <div className="space-y-4">
            <div className="h-3 w-32 bg-accent/40" />
            <div className="h-12 w-full bg-ink/10" />
            <div className="h-12 w-5/6 bg-ink/10" />
            <div className="h-12 w-4/6 bg-accent/40" />
          </div>
          <div className="space-y-3 lg:pt-12">
            <div className="h-4 w-full bg-ink/10" />
            <div className="h-4 w-11/12 bg-ink/10" />
            <div className="h-4 w-10/12 bg-ink/10" />
            {/* Quick facts dl sidebar */}
            <div className="mt-6 space-y-3 pt-6 border-t-2 border-ink/10">
              <div className="h-3 w-24 bg-accent/40 mb-3" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-baseline justify-between gap-4 border-b border-ink/10 pb-2">
                  <div className="h-3 w-16 bg-ink/10" />
                  <div className="h-3 w-24 bg-ink/15" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="border-b-4 border-ink bg-surface">
        <div className={`${SC} py-16 md:py-20`}>
          <div className="h-3 w-24 bg-accent/40 mb-3" />
          <div className="h-12 w-72 bg-ink/10 mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-surface border-2 border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)]"
              >
                <div className="h-3 w-16 bg-ink/10 mb-3" />
                <div className="h-6 w-24 bg-ink/20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery irregular */}
      <div className="border-b-4 border-ink">
        <div className={`${SC} py-16 md:py-20`}>
          <div className="h-3 w-24 bg-accent/40 mb-3" />
          <div className="h-12 w-48 bg-ink/10 mb-10" />
          <div className="grid grid-cols-4 gap-4 md:gap-6">
            <div className="col-span-2 bg-ink/10 border-4 border-ink aspect-square" />
            <div className="bg-ink/10 border-4 border-ink aspect-square" />
            <div className="bg-ink/10 border-4 border-ink aspect-square" />
            <div className="bg-ink/10 border-4 border-ink aspect-square" />
            <div className="col-span-2 bg-ink/10 border-4 border-ink aspect-[2/1]" />
            <div className="bg-ink/10 border-4 border-ink aspect-square" />
            <div className="bg-ink/10 border-4 border-ink aspect-square" />
          </div>
        </div>
      </div>

      {/* Related works */}
      <div className="border-t-4 border-ink bg-surface">
        <div className={`${SC} py-16 md:py-20`}>
          <div className="h-3 w-32 bg-accent/40 mb-3" />
          <div className="h-12 w-64 bg-ink/10 mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]"
              >
                <div className="aspect-square bg-ink/10 border-b-2 border-ink" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-full bg-ink/10" />
                  <div className="h-3 w-2/3 bg-ink/10" />
                  <div className="h-7 w-24 bg-accent/40 border-2 border-ink" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA — bg-primary section */}
      <section className="bg-primary text-surface animate-pulse">
        <div className={`${SC} py-16 md:py-20 text-center`}>
          <div className="h-3 w-56 bg-accent/40 mx-auto mb-4" />
          <div className="space-y-3 mb-8 max-w-3xl mx-auto">
            <div className="h-12 w-3/4 mx-auto bg-surface/30" />
            <div className="h-12 w-1/2 mx-auto bg-accent/40" />
          </div>
          <div className="h-14 w-56 bg-surface border-4 border-ink shadow-[6px_6px_0_0_var(--color-accent)] mx-auto" />
        </div>
      </section>
    </div>
  );
}