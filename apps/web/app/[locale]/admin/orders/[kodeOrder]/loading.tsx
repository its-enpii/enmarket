/**
 * Admin order detail loading skeleton.
 * Mirror: AdminPageHeader (h1 kode order) → card status/aksi →
 * card pembeli (4 field, 2 kolom) → tabel item 4 kolom.
 */
export default function kodeOrderLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6 animate-pulse">
      {/* Header */}
      <header className="border-b-4 border-ink pb-6">
        <div className="h-4 w-32 bg-accent/40 mb-3" />
        <div className="h-12 w-64 max-w-full bg-ink/20" />
        <div className="mt-3 h-5 w-full max-w-2xl bg-ink/10 border-l-4 border-accent pl-4" />
      </header>

      {/* Quick info + actions */}
      <div className="bg-surface border-2 border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)] flex flex-wrap items-center gap-3">
        <div className="h-7 w-24 bg-accent/40 border-2 border-ink" />
        <div className="h-4 w-32 bg-ink/15" />
        <div className="h-4 w-28 bg-ink/15" />
        <div className="ml-auto flex flex-wrap gap-2">
          <div className="h-9 w-28 bg-ink/10 border-2 border-ink" />
          <div className="h-9 w-24 bg-ink/10 border-2 border-ink" />
        </div>
      </div>

      {/* Buyer card — 4 field, 2 kolom */}
      <div className="bg-surface border-2 border-ink p-6 md:p-8 shadow-[4px_4px_0_0_var(--color-ink)]">
        <div className="mb-5 space-y-2">
          <div className="h-3 w-24 bg-accent/40" />
          <div className="h-6 w-40 bg-ink/20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-20 bg-ink/15" />
              <div className="h-5 w-3/4 bg-ink/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Items table — 4 kolom */}
      <div className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary">
                {[0, 1, 2, 3].map((i) => (
                  <th key={i} className="px-4 py-3 border-b-2 border-ink">
                    <div className="h-3 w-3/4 bg-surface/30" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, r) => (
                <tr key={r} className={r % 2 === 0 ? 'bg-surface' : 'bg-surface/50'}>
                  {[0, 1, 2, 3].map((c) => (
                    <td key={c} className="px-4 py-3 border-b border-ink/20">
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
