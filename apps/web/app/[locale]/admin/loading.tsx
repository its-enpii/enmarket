/**
 * Admin home loading skeleton.
 * Mirror: p-6 sm:p-8 space-y-8 → header (border-b-4) →
 * 6 stat tiles (2/3/6 cols) → 2 panel (lg 2 cols) → 4 tombol aksi (2/4 cols).
 */
export default function adminLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-8 animate-pulse">
      {/* Header */}
      <header className="border-b-4 border-ink pb-6">
        <div className="h-4 w-32 bg-accent/40 mb-3" />
        <div className="h-12 w-64 max-w-full bg-ink/20" />
        <div className="mt-3 h-5 w-full max-w-2xl bg-ink/10 border-l-4 border-accent pl-4" />
      </header>

      {/* Stat tiles — 6 */}
      <section>
        <div className="h-3 w-24 bg-ink/15 mb-3" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`border-2 border-ink p-4 flex flex-col justify-between h-28 ${
                i === 1 || i === 3 ? 'bg-accent/30' : i === 2 || i === 4 ? 'bg-primary/20' : 'bg-surface'
              } shadow-[4px_4px_0_0_var(--color-ink)]`}
            >
              <div className="h-3 w-16 bg-ink/15" />
              <div className="h-7 w-20 bg-ink/20" />
            </div>
          ))}
        </div>
      </section>

      {/* 2 panel */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] flex flex-col max-h-[28rem]"
          >
            <div className="shrink-0 flex items-baseline justify-between mb-4 border-b-2 border-ink pb-3">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-accent/40" />
                <div className="h-6 w-40 bg-ink/20" />
              </div>
              <div className="h-3 w-14 bg-ink/10" />
            </div>
            <div className="space-y-3">
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="bg-ink/10 border-2 border-ink p-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-32 bg-ink/20" />
                    <div className="h-3 w-24 bg-ink/15" />
                  </div>
                  <div className="text-right space-y-2 shrink-0">
                    <div className="h-4 w-16 bg-ink/20" />
                    <div className="h-3 w-20 bg-ink/15" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 4 tombol aksi */}
      <section>
        <div className="h-3 w-32 bg-ink/15 mb-3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-12 border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] ${
                i === 0 || i === 1 ? 'bg-primary/20' : i === 2 ? 'bg-accent/30' : 'bg-surface'
              }`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
