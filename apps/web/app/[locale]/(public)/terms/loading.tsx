/**
 * Legal page (terms/privacy) loading skeleton.
 * Mirror: PageHeader → grid [300px_minmax(0,1fr)] (lg) →
 * KIRI sticky TOC card 300px, KANAN section-section legal
 * (border-4 border-ink bg-surface p-6 md:p-8 shadow-brutal-6).
 */
export default function legalLoading() {
  return (
    <div className="animate-pulse">
      {/* PageHeader */}
      <section className="border-b-4 border-ink">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-20 md:py-28">
          <div className="h-4 w-32 bg-accent/40 mb-6" />
          <div className="h-14 w-72 max-w-full bg-ink/20" />
          <div className="mt-8 h-6 w-full max-w-2xl bg-ink/10 border-l-4 border-accent pl-6" />
        </div>
      </section>

      {/* 2-col legal layout */}
      <section className="bg-surface">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
          {/* KIRI — sticky TOC card 300px */}
          <aside className="lg:sticky lg:top-28">
            <div className="bg-surface border-4 border-ink p-6 md:p-8 shadow-[6px_6px_0_0_var(--color-ink)]">
              <div className="border-b-2 border-ink pb-3 mb-4">
                <div className="h-5 w-40 bg-ink/20" />
                <div className="mt-2 h-3 w-32 bg-ink/10" />
              </div>
              <div className="flex flex-col gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-3.5 py-2.5 border-2 ${
                      i === 0 ? 'bg-accent/40 border-ink' : 'border-transparent'
                    }`}
                  >
                    <div className="w-5 h-4 bg-ink/20 shrink-0" />
                    <div className="w-2 h-2 mt-1 bg-ink/20 shrink-0" />
                    <div className="h-4 flex-1 bg-ink/15" />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* KANAN — section legal */}
          <div className="min-w-0 space-y-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="border-4 border-ink bg-surface p-6 md:p-8 shadow-[6px_6px_0_0_var(--color-ink)] space-y-4"
              >
                <div className="h-8 w-2/3 bg-ink/20" />
                {[0, 1, 2].map((j) => (
                  <div key={j} className="h-4 w-full bg-ink/10" />
                ))}
                <div className="h-4 w-4/5 bg-ink/10" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
