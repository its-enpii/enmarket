/**
 * Admin media library loading skeleton.
 * Mirror: AdminPageHeader → filter bar → media grid
 * (2/3/4 kolom kartu media dengan aspect thumbnail).
 */
export default function mediaLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6 animate-pulse">
      {/* Header */}
      <header className="border-b-4 border-ink pb-6">
        <div className="h-4 w-32 bg-accent/40 mb-3" />
        <div className="h-12 w-72 max-w-full bg-ink/20" />
        <div className="mt-3 h-5 w-full max-w-2xl bg-ink/10 border-l-4 border-accent pl-4" />
      </header>

      {/* Filter bar */}
      <div className="bg-surface border-2 border-ink p-3 shadow-[3px_3px_0_0_var(--color-ink)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="w-full sm:flex-1 sm:min-w-[200px] space-y-1">
            <div className="h-3 w-14 bg-ink/15" />
            <div className="h-11 w-full bg-ink/10 border-2 border-ink" />
          </div>
          {[0, 1].map((i) => (
            <div key={i} className="w-full sm:w-40 space-y-1">
              <div className="h-3 w-16 bg-ink/15" />
              <div className="h-11 w-full bg-ink/10 border-2 border-ink" />
            </div>
          ))}
          <div className="h-11 w-full sm:w-32 sm:ml-auto bg-primary/20 border-2 border-ink" />
        </div>
      </div>

      {/* Media grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden"
          >
            <div className="aspect-square bg-primary/10 border-b-2 border-ink" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-full bg-ink/15" />
              <div className="h-3 w-2/3 bg-ink/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
