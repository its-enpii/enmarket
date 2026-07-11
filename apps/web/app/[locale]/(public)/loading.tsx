/**
 * Skeleton untuk beranda publik.
 * Match dengan real page (Hero + PillarsSection + FeaturedSection + JournalSection).
 * Layout full-bleed, px-6 md:px-12, border-b-4 border-ink antar section.
 */
export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* ===================== 1. HERO ===================== */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 md:px-12 py-24 border-b-4 border-ink">
        <div className="w-full max-w-5xl">
          {/* small accent label */}
          <div className="h-4 w-32 mx-auto bg-accent/40 mb-8" />

          {/* big headline 3 lines */}
          <div className="space-y-3 mb-10">
            <div className="h-12 sm:h-16 w-full bg-ink/15" />
            <div className="h-12 sm:h-16 w-3/4 mx-auto bg-ink/15" />
            <div className="h-12 sm:h-16 w-1/2 mx-auto bg-ink/15" />
          </div>

          {/* italic body 2 lines */}
          <div className="border-l-4 border-accent pl-6 mb-12 max-w-2xl mx-auto space-y-3">
            <div className="h-5 w-2/3 bg-ink/15" />
            <div className="h-5 w-1/2 mx-auto bg-ink/15" />
          </div>

          {/* CTA button */}
          <div className="h-12 w-44 mx-auto bg-accent/40 border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]" />
        </div>
      </section>

      {/* ===================== 2. PILLARS ===================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-b-4 border-ink">
        {/* Discover | Develop (2 cols) */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface p-12 md:p-20 border-b-4 md:border-b-0 md:border-r-4 last:border-r-0 border-ink"
          >
            <div className="flex flex-col gap-6">
              {/* 64x64 icon badge */}
              <div
                className={`h-16 w-16 border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] ${
                  i === 0 ? 'bg-primary/40' : 'bg-accent/40'
                }`}
              />
              {/* headline */}
              <div className="h-10 w-40 bg-ink/15" />
              {/* body 2 lines */}
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-ink/15" />
                <div className="h-5 w-2/3 bg-ink/15" />
              </div>
              {/* arrow link */}
              <div className="h-4 w-28 bg-ink/15 mt-2" />
            </div>
          </div>
        ))}

        {/* Display — full-width pillar */}
        <div className="md:col-span-2 bg-surface p-12 md:p-24 text-center border-t-4 border-ink">
          <div className="flex flex-col items-center gap-6">
            <div className="h-16 w-16 bg-ink/20 border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]" />
            <div className="h-10 w-32 bg-ink/15" />
            <div className="space-y-2 max-w-2xl">
              <div className="h-5 w-2/3 mx-auto bg-ink/15" />
              <div className="h-5 w-1/2 mx-auto bg-ink/15" />
            </div>
            <div className="h-4 w-28 bg-ink/15" />
          </div>
        </div>
      </section>

      {/* ===================== 3. FEATURED ===================== */}
      <section className="py-24 px-6 md:px-12 border-b-4 border-ink">
        {/* Header row */}
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-2">
            <div className="h-14 w-3/4 bg-ink/15" />
            <div className="h-14 w-1/2 bg-ink/15" />
          </div>
          <div className="hidden md:block h-5 w-36 bg-ink/15" />
        </div>

        {/* 4 zig-zag rows */}
        <div className="flex flex-col gap-24">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center"
            >
              {/* Image col-8 */}
              <div
                className={`md:col-span-8 ${i % 2 === 1 ? 'md:order-2' : 'md:order-1'} order-1`}
              >
                <div className="bg-surface border-4 border-ink shadow-[10px_10px_0_0_var(--color-ink)] -rotate-1">
                  <div className="aspect-video bg-primary/10" />
                </div>
              </div>

              {/* Text col-4 */}
              <div
                className={`md:col-span-4 ${i % 2 === 1 ? 'md:order-1' : 'md:order-2'} order-2 flex flex-col gap-4`}
              >
                {/* gold price chip */}
                <div className="h-7 w-24 bg-accent/50 border-2 border-ink" />
                {/* title 2 lines */}
                <div className="space-y-2">
                  <div className="h-8 w-3/4 bg-ink/15" />
                  <div className="h-8 w-1/2 bg-ink/15" />
                </div>
                {/* body 2 lines */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-ink/10" />
                  <div className="h-4 w-5/6 bg-ink/10" />
                </div>
                {/* arrow link */}
                <div className="h-4 w-28 bg-ink/15 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== 4. JOURNAL ===================== */}
      <section className="py-24 px-6 md:px-12 bg-surface border-b-4 border-ink">
        {/* Heading row */}
        <div className="flex items-center gap-4 mb-20">
          <div className="h-10 w-64 bg-ink/15 shrink-0" />
          <div className="h-1 bg-ink/15 flex-1" />
        </div>

        {/* 2 entries alternating */}
        <div className="flex flex-col gap-16">
          {Array.from({ length: 2 }).map((_, i) => (
            <article
              key={i}
              className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center"
            >
              {/* Image col-5 */}
              <div
                className={`md:col-span-5 ${i % 2 === 1 ? 'md:order-2' : 'md:order-1'}`}
              >
                <div className="aspect-[4/3] bg-primary/10 border-2 border-ink" />
              </div>

              {/* Text col-7 */}
              <div
                className={`md:col-span-7 ${i % 2 === 1 ? 'md:order-1' : 'md:order-2'} flex flex-col gap-4`}
              >
                {/* chip row */}
                <div className="flex items-center gap-4">
                  <div className="h-6 w-20 bg-primary/50" />
                  <div className="h-4 w-24 bg-ink/15" />
                </div>
                {/* headline 2 lines big */}
                <div className="space-y-2">
                  <div className="h-10 w-3/4 bg-ink/15" />
                  <div className="h-10 w-1/2 bg-ink/15" />
                </div>
                {/* body 2 lines */}
                <div className="space-y-2">
                  <div className="h-5 w-full bg-ink/10" />
                  <div className="h-5 w-5/6 bg-ink/10" />
                </div>
                {/* arrow link */}
                <div className="h-5 w-32 bg-ink/15 mt-4" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
