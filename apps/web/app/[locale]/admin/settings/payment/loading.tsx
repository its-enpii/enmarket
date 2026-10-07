/**
 * Admin settings form loading skeleton.
 * Mirror: AdminPageHeader → form card (baris input berjejer 2 kolom) + button.
 */
export default function settingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <header className="border-b-4 border-ink pb-6">
        <div className="h-4 w-32 bg-accent/40 mb-3" />
        <div className="h-12 w-72 max-w-full bg-ink/20" />
        <div className="mt-3 h-5 w-full max-w-2xl bg-ink/10 border-l-4 border-accent pl-4" />
      </header>

      {/* Form card */}
      <div className="bg-surface border-2 border-ink p-6 md:p-8 shadow-[4px_4px_0_0_var(--color-ink)] space-y-8">
        {[0, 1, 2].map((section) => (
          <section key={section} className="space-y-5">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-accent/40" />
              <div className="h-6 w-48 bg-ink/20" />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-24 bg-ink/15" />
                  <div className="h-11 w-full bg-ink/10 border-2 border-ink" />
                </div>
              ))}
            </div>
          </section>
        ))}
        <div className="flex flex-wrap gap-3 pt-2 border-t-2 border-ink/10">
          <div className="h-11 w-32 bg-primary/20 border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]" />
          <div className="h-11 w-28 bg-ink/10 border-2 border-ink" />
        </div>
      </div>
    </div>
  );
}
