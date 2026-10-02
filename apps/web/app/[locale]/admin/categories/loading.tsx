/**
 * Admin categories list loading skeleton.
 * Mirror: AdminPageHeader → AdminTableHeader (search flex-1 + reset + action)
 * → tabel 5 kolom.
 */
export default function categoriesLoading() {
  const cols = [undefined, undefined, '100px', '140px', '200px'];

  return (
    <div className="p-6 sm:p-8 space-y-6 animate-pulse">
      {/* Header */}
      <header className="border-b-4 border-ink pb-6">
        <div className="h-4 w-32 bg-accent/40 mb-3" />
        <div className="h-12 w-72 max-w-full bg-ink/20" />
        <div className="mt-3 h-5 w-full max-w-2xl bg-ink/10 border-l-4 border-accent pl-4" />
      </header>

      {/* Filter bar: search flex-1 + reset + action */}
      <div className="bg-surface border-2 border-ink p-3 shadow-[3px_3px_0_0_var(--color-ink)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="w-full sm:flex-1 sm:min-w-[200px] space-y-1">
            <div className="h-3 w-14 bg-ink/15" />
            <div className="h-11 w-full bg-ink/10 border-2 border-ink" />
          </div>
          <div className="h-11 w-full sm:w-20 bg-ink/10 border-2 border-ink" />
          <div className="h-11 w-full sm:w-32 sm:ml-auto bg-primary/20 border-2 border-ink" />
        </div>
      </div>

      {/* Tabel 5 kolom */}
      <div className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary">
                {cols.map((w, i) => (
                  <th key={i} style={w ? { width: w } : undefined} className="px-4 py-3 border-b-2 border-ink">
                    <div className="h-3 w-3/4 bg-surface/30" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, r) => (
                <tr key={r} className={r % 2 === 0 ? 'bg-surface' : 'bg-surface/50'}>
                  {cols.map((w, c) => (
                    <td key={c} style={w ? { width: w } : undefined} className="px-4 py-3 border-b border-ink/20">
                      <div className="h-4 bg-ink/15" style={{ width: `${45 + ((r + c) % 4) * 12}%` }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
