/**
 * Display detail (artikel) loading skeleton.
 * Mirror: breadcrumb bar → cover hero (aspect-video) → article header
 * (kategori pill + h1 2-3 baris + metadata byline) → content paragraphs max-w-3xl.
 */
export default function displaySlugLoading() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb bar */}
      <div className="bg-surface border-b-2 border-ink/20">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-6">
          <div className="h-4 w-40 bg-ink/15" />
        </div>
      </div>

      {/* Cover hero — aspect-video card */}
      <section className="border-b-4 border-ink">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-12 md:py-16">
          <div className="border-4 border-ink bg-surface shadow-[12px_12px_0_0_var(--color-ink)] overflow-hidden">
            <div className="w-full aspect-video bg-primary/10" />
          </div>
        </div>
      </section>

      {/* Article header — tag pill + h1 + byline */}
      <section className="border-b-4 border-ink bg-surface">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-12 md:py-16">
          <div className="h-4 w-24 bg-accent/40 mb-6" />
          <div className="space-y-4 max-w-5xl">
            <div className="h-12 w-full bg-ink/20" />
            <div className="h-12 w-5/6 bg-ink/20" />
            <div className="h-12 w-2/3 bg-ink/20" />
          </div>
          <div className="mt-8 h-6 w-full max-w-3xl bg-ink/10 border-l-4 border-accent pl-6" />
          {/* Meta strip */}
          <div className="mt-10 inline-flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]">
            <div className="h-6 w-20 bg-accent/40 border-2 border-ink" />
            <div className="h-4 w-28 bg-ink/15" />
            <div className="h-4 w-20 bg-ink/15" />
            <div className="h-4 w-24 bg-ink/15" />
          </div>
        </div>
      </section>

      {/* Article content — paragraf blok max-w-3xl */}
      <section className="bg-surface">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12 py-16 md:py-24">
          <div className="max-w-3xl mx-auto space-y-8">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 w-full bg-ink/10" />
                <div className="h-4 w-full bg-ink/10" />
                <div className="h-4 w-4/5 bg-ink/10" />
              </div>
            ))}
            <div className="border-l-8 border-accent pl-6 py-2 space-y-3">
              <div className="h-8 w-full bg-ink/15" />
              <div className="h-8 w-3/4 bg-ink/15" />
            </div>
            {[0, 1].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 w-full bg-ink/10" />
                <div className="h-4 w-11/12 bg-ink/10" />
                <div className="h-4 w-2/3 bg-ink/10" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
