/**
 * Skeleton untuk halaman daftar pesanan admin.
 * Topbar sudah di-handle oleh layout (sticky AdminTopbar).
 */
export default function OrdersLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <header className="border-b-4 border-ink pb-6">
        <div className="h-3 w-28 bg-accent/40 mb-3" />
        <div className="h-12 sm:h-16 w-2/5 bg-ink/15 mb-3" />
        <div className="h-4 w-3/4 bg-ink/10 max-w-2xl border-l-4 border-accent pl-4" />
      </header>

      {/* Filter bar skeleton */}
      <div className="bg-surface border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)] flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] h-10 bg-ink/10" />
        <div className="w-32 h-10 bg-ink/10" />
        <div className="w-32 h-10 bg-ink/10" />
        <div className="w-32 h-10 bg-ink/10" />
      </div>

      {/* Table skeleton */}
      <div className="border-2 border-ink bg-surface shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden">
        <div className="h-12 bg-primary/40" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 border-b border-ink/20 flex items-center px-4 gap-4">
            <div className="h-4 bg-ink/15 w-32 font-mono" />
            <div className="flex flex-col gap-1 flex-1">
              <div className="h-4 bg-ink/15 w-32" />
              <div className="h-3 bg-ink/10 w-40" />
            </div>
            <div className="h-4 bg-ink/15 w-28" />
            <div className="h-6 bg-accent/40 w-20 border-2 border-ink" />
            <div className="h-3 bg-ink/10 w-24" />
            <div className="h-7 w-16 bg-ink/15 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
