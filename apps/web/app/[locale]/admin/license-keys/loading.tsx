/**
 * Skeleton untuk halaman license keys admin.
 * Topbar sudah di-handle oleh layout (sticky AdminTopbar).
 */
export default function LicenseKeysLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <header className="border-b-4 border-ink pb-6">
        <div className="h-3 w-28 bg-accent/40 mb-3" />
        <div className="h-12 sm:h-16 w-3/5 bg-ink/15 mb-3" />
        <div className="h-4 w-3/4 bg-ink/10 max-w-2xl border-l-4 border-accent pl-4" />
      </header>

      {/* Filter bar skeleton */}
      <div className="bg-surface border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)] flex gap-3">
        <div className="flex-1 h-10 bg-ink/10" />
        <div className="w-40 h-10 bg-ink/10" />
        <div className="w-32 h-10 bg-ink/10" />
        <div className="w-40 h-10 bg-primary border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)] ml-auto" />
      </div>

      {/* Table skeleton */}
      <div className="border-2 border-ink bg-surface shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden">
        <div className="h-12 bg-primary/40" />
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-ink/20 bg-ink/5 flex items-center px-4 gap-4">
            <div className="h-6 bg-ink/10 w-56 font-mono" />
            <div className="h-4 bg-ink/10 flex-1 max-w-[200px]" />
            <div className="h-6 bg-accent/40 w-20 border-2 border-ink" />
            <div className="h-3 bg-ink/10 w-24" />
            <div className="h-3 bg-ink/10 w-24" />
            <div className="h-3 bg-ink/10 w-24" />
            <div className="ml-auto flex gap-2">
              <div className="h-7 w-16 bg-ink/15" />
              <div className="h-7 w-16 bg-accent/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
