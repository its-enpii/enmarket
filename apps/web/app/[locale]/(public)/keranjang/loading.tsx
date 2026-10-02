/**
 * Keranjang loading skeleton.
 * Header full-bleed (PageHeader tall) + section 2 kolom [7fr_5fr]:
 *   KIRI  = daftar kartu item horizontal (thumbnail 32x32 + info + kontrol)
 *   KANAN = panel ringkasan bg-primary sticky + blok catatan bordered
 */
export default function keranjangLoading() {
  return (
    <div className="animate-pulse">
      {/* Header — mirror PageHeader size="tall" */}
      <section className="border-b-4 border-ink">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-20 md:py-28">
          <div className="h-4 w-32 bg-accent/40 mb-6" />
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="h-14 w-80 max-w-full bg-ink/20" />
            <div className="h-5 w-40 bg-ink/10" />
          </div>
          <div className="mt-8 h-6 w-full max-w-2xl bg-ink/10 border-l-4 border-accent pl-6" />
        </div>
      </section>

      {/* Band — 2 kolom */}
      <section className="bg-surface border-b-4 border-ink">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-10 lg:gap-12 items-start">
          {/* KIRI — daftar item */}
          <div className="space-y-6">
            <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
              <div className="h-4 w-40 bg-ink/15" />
              <div className="h-4 w-16 bg-ink/10" />
            </div>
            <div className="space-y-5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="shrink-0 sm:w-32 sm:h-32 aspect-video sm:aspect-square border-b-2 sm:border-b-0 sm:border-r-2 border-ink bg-primary/10" />
                    <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-3 w-20 bg-ink/10" />
                          <div className="h-5 w-3/4 bg-ink/20" />
                        </div>
                        <div className="h-7 w-24 bg-accent/40 border-2 border-ink shrink-0" />
                      </div>
                      <div className="h-4 w-40 bg-ink/10 border-l-2 border-ink/20 pl-3" />
                      <div className="flex flex-wrap items-center gap-3 pt-2 border-t-2 border-ink/10">
                        <div className="h-9 w-28 bg-ink/10 border-2 border-ink" />
                        <div className="h-9 w-9 bg-ink/10 border-2 border-ink" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KANAN — summary sticky + trust note */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-primary/20 border-4 border-ink shadow-[8px_8px_0_0_var(--color-ink)] p-6 md:p-8 space-y-5">
              <div className="h-4 w-32 bg-accent/40" />
              <div className="flex items-baseline justify-between border-b border-surface/20 pb-3">
                <div className="h-4 w-20 bg-surface/40" />
                <div className="h-5 w-24 bg-surface/40" />
              </div>
              <div className="pt-2 space-y-2">
                <div className="h-4 w-16 bg-surface/40" />
                <div className="h-14 w-56 max-w-full bg-accent/40 border-2 border-ink" />
                <div className="h-3 w-16 bg-surface/30 mt-3" />
              </div>
              <div className="h-12 w-full bg-surface/40 border-2 border-ink" />
              <div className="h-3 w-40 mx-auto bg-surface/30" />
            </div>
            <div className="bg-surface border-2 border-ink p-5 space-y-2">
              <div className="h-3 w-24 bg-accent/40" />
              <div className="h-5 w-3/4 bg-ink/20" />
              <div className="h-3 w-full bg-ink/10" />
              <div className="h-3 w-2/3 bg-ink/10" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
