/**
 * Homepage loading skeleton.
 * Mirror urutan section asli: Hero → Pillars → Featured → Sponsors → Journal.
 * Self-contained (tidak pakai shared loader) sesuai brief.
 */
export default function publicLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero — Surface, centered, single CTA */}
      <section className="min-h-[52vh] sm:min-h-[68vh] flex flex-col items-center justify-center text-center border-b-4 border-ink">
        <div className="w-full mx-auto max-w-screen-2xl px-6 md:px-12 py-16 md:py-24">
          {/* sticker row */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="h-6 w-44 bg-ink/10 border-2 border-ink" />
            <div className="h-6 w-44 bg-ink/10 border-2 border-ink" />
          </div>
          {/* headline — 3 baris */}
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="h-9 w-64 bg-ink/20" />
            <div className="h-9 w-48 bg-ink/20" />
            <div className="h-9 w-72 max-w-full bg-ink/20" />
          </div>
          {/* italic body */}
          <div className="h-5 w-full max-w-2xl mx-auto bg-ink/10 border-x-4 border-accent mb-8" />
          <div className="h-5 w-4/5 max-w-xl mx-auto bg-ink/10 mb-8" />
          <div className="h-4 w-72 bg-ink/10 border border-ink/20 mx-auto mb-12" />
          {/* CTA */}
          <div className="h-14 w-56 mx-auto bg-accent/40 border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]" />
        </div>
      </section>

      {/* Pillars — 2 atas (md 2 col) + 1 full-width bawah; ikon 64x64 */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-b-4 border-ink">
        {[0, 1].map((i) => (
          <div
            key={i}
            className={`py-12 md:py-20 ${i === 0 ? 'pl-6 md:pl-12 pr-12 md:pr-20 md:border-r-4 border-b-4 md:border-b-0 border-ink' : 'pl-12 md:pl-20 pr-0 border-b-4 md:border-b-0 border-ink'}`}
          >
            <div className="flex flex-col gap-6">
              <div className="w-16 h-16 border-4 border-ink bg-primary/20" />
              <div className="h-8 w-40 bg-ink/20" />
              <div className="h-4 w-full max-w-md bg-ink/10" />
              <div className="h-4 w-2/3 max-w-sm bg-ink/10" />
              <div className="h-4 w-32 bg-ink/15 mt-2" />
            </div>
          </div>
        ))}
        <div className="md:col-span-2 p-12 md:p-24 text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-ink bg-ink/20" />
          <div className="h-8 w-40 bg-ink/20" />
          <div className="h-4 w-full max-w-2xl bg-ink/10" />
          <div className="h-4 w-1/2 bg-ink/15 mt-2" />
        </div>
      </section>

      {/* Featured — heading + label + 4 baris zig-zag (image 8 / text 4) */}
      <section className="border-b-4 border-ink">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-16 md:py-24">
          <div className="flex justify-between items-end mb-16">
            <div className="h-10 w-56 bg-ink/20" />
            <div className="hidden md:block h-4 w-32 bg-ink/10" />
          </div>
          <div className="flex flex-col gap-24">
            {[0, 1, 2, 3].map((i) => {
              const flip = i % 2 === 1;
              return (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className={`md:col-span-8 ${flip ? 'md:order-2' : 'md:order-1'}`}>
                    <div className="aspect-video w-full bg-primary/10 border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]" />
                  </div>
                  <div className={`md:col-span-4 ${flip ? 'md:order-1' : 'md:order-2'} flex flex-col gap-4`}>
                    <div className="h-7 w-28 bg-accent/40 border-2 border-ink" />
                    <div className="h-7 w-full bg-ink/20" />
                    <div className="h-4 w-full bg-ink/10" />
                    <div className="h-4 w-3/4 bg-ink/10" />
                    <div className="h-4 w-32 bg-ink/15 mt-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sponsors placeholder band */}
      <section className="border-b-4 border-ink">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-16 md:py-24">
          <div className="h-4 w-40 bg-ink/10 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-ink/10 border-2 border-ink" />
            ))}
          </div>
        </div>
      </section>

      {/* Journal — heading + garis ink + 2 entri (image 5 / text 7) */}
      <section className="bg-surface">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-16 md:py-24">
          <div className="flex items-center gap-4 mb-20">
            <div className="h-8 w-40 bg-ink/20 shrink-0" />
            <div className="h-1 bg-ink w-full" />
          </div>
          <div className="flex flex-col gap-16">
            {[0, 1].map((i) => {
              const flip = i % 2 === 1;
              return (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className={`md:col-span-5 ${flip ? 'md:order-2' : 'md:order-1'}`}>
                    <div className="aspect-[4/3] w-full bg-primary/10 border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]" />
                  </div>
                  <div className={`md:col-span-7 ${flip ? 'md:order-1' : 'md:order-2'} flex flex-col gap-4`}>
                    <div className="flex items-center gap-4">
                      <div className="h-6 w-24 bg-primary/20" />
                      <div className="h-4 w-24 bg-ink/10" />
                    </div>
                    <div className="h-8 w-full bg-ink/20" />
                    <div className="h-4 w-full bg-ink/10" />
                    <div className="h-4 w-5/6 bg-ink/10" />
                    <div className="h-5 w-36 bg-ink/15 mt-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
