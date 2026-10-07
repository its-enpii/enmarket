/**
 * Admin reviews list loading skeleton.
 * Mirror: AdminPageHeader → filter bar → DataTable 5 kolom → paginasi.
 */
export default function reviewsLoading() {
  const cols = Array.from({ length: 5 });

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
          <div className="w-full sm:w-40 space-y-1">
            <div className="h-3 w-16 bg-ink/15" />
            <div className="h-11 w-full bg-ink/10 border-2 border-ink" />
          </div>
          <div className="h-11 w-full sm:w-20 bg-ink/10 border-2 border-ink" />
          <div className="h-11 w-full sm:w-32 sm:ml-auto bg-primary/20 border-2 border-ink" />
        </div>
      </div>

      {/* DataTable 5 kolom */}
      <div className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary">
                {cols.map((_, i) => (
                  <th key={i} className={`px-4 py-3 border-b-2 border-ink ${i === 0 ? 'pl-5' : ''} ${i === cols.length - 1 ? 'pr-5' : ''}`}>
                    <div className="h-3 w-3/4 bg-surface/30" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-ink/15">
              {Array.from({ length: 8 }).map((_, r) => (
                <tr key={r} className={r % 2 === 0 ? 'bg-surface' : 'bg-surface/50'}>
                  {cols.map((_, c) => (
                    <td key={c} className={`px-4 py-3 ${c === 0 ? 'pl-5' : ''} ${c === cols.length - 1 ? 'pr-5' : ''} border-b border-ink/20`}>
                      <div className="h-4 w-3/4 bg-ink/15" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginasi */}
      <div className="flex gap-2 justify-center flex-wrap items-center">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-9 w-9 bg-ink/10 border-2 border-ink" />
        ))}
      </div>
    </div>
  );
}
