/**
 * Display loading skeleton.
 * Mirror: PageHeader → tag chips + search bar → asymmetric journal grid
 * (1 artikel besar "featured" 7/5 + 2 artikel medium 7/5).
 */
export default function displayLoading() {
  return (
    <div className="animate-pulse">
      {/* Header — PageHeader */}
      <section className="border-b-4 border-ink">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-20 md:py-28">
          <div className="h-4 w-32 bg-accent/40 mb-6" />
          <div className="h-14 w-80 max-w-full bg-ink/20" />
          <div className="mt-8 h-6 w-full max-w-2xl bg-ink/10 border-l-4 border-accent pl-6" />
        </div>
      </section>

      {/* Tag chips + search */}
      <section className="bg-surface border-b-4 border-ink">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-4 w-16 bg-ink/15" />
            {['w-20', 'w-16', 'w-24', 'w-14'].map((w, i) => (
              <div
                key={i}
                className={`h-8 border-2 border-ink ${w} ${i % 2 === 0 ? 'bg-accent/30' : 'bg-primary/20'}`}
              />
            ))}
          </div>
          <div className="w-full lg:w-80 lg:shrink-0 h-11 bg-ink/10 border-2 border-ink" />
        </div>
      </section>

      {/* Featured besar — 7/5 */}
      <section className="bg-surface border-b-4 border-ink">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-16 md:py-24">
          <div className="border-4 border-ink bg-surface shadow-[6px_6px_0_0_var(--color-ink)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 aspect-43 lg:aspect-auto lg:min-h-[300px] bg-primary/10 border-b-4 lg:border-b-0 lg:border-r-4 border-ink" />
              <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center gap-4">
                <div className="h-3 w-24 bg-accent/40" />
                <div className="h-9 w-full bg-ink/20" />
                <div className="h-9 w-2/3 bg-ink/20" />
                <div className="h-4 w-full bg-ink/10" />
                <div className="h-4 w-4/5 bg-ink/10" />
                <div className="h-4 w-28 bg-primary/20 mt-2" />
              </div>
            </div>
          </div>

          {/* 2 artikel medium — 7/5 */}
          <div className="mt-10 space-y-10">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="border-4 border-ink bg-surface shadow-[6px_6px_0_0_var(--color-ink)] overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-12">
                  <div className="md:col-span-7 aspect-video bg-primary/10 border-b-4 md:border-b-0 md:border-r-4 border-ink" />
                  <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-center gap-3">
                    <div className="h-6 w-20 bg-accent/30 border-2 border-ink" />
                    <div className="h-7 w-full bg-ink/20" />
                    <div className="h-7 w-3/4 bg-ink/20" />
                    <div className="h-4 w-full bg-ink/10" />
                    <div className="h-4 w-24 bg-primary/20 mt-1" />
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
