/**
 * Skeleton untuk halaman license keys admin.
 */
export default function LicenseKeysLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="h-16 bg-surface border-2 border-ink animate-pulse" />
      <div className="bg-surface border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)] animate-pulse flex gap-3">
        <div className="flex-1 h-10 bg-ink/10" />
        <div className="w-40 h-10 bg-ink/10" />
        <div className="w-32 h-10 bg-ink/10" />
      </div>
      <div className="border-2 border-ink bg-surface shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden animate-pulse">
        <div className="h-12 bg-primary" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-ink/20 bg-ink/5" />
        ))}
      </div>
    </div>
  );
}