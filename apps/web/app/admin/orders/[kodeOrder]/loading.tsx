/**
 * Skeleton untuk halaman detail order admin.
 */
export default function OrderDetailLoading() {
  return (
    <div className="p-6 sm:p-8 max-w-6xl space-y-6">
      <div className="h-16 bg-surface border-2 border-ink animate-pulse" />
      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] animate-pulse space-y-3">
        <div className="h-6 w-48 bg-ink/10" />
        <div className="h-4 w-3/4 bg-ink/10" />
        <div className="h-4 w-2/3 bg-ink/10" />
      </div>
      <div className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden animate-pulse">
        <div className="h-12 bg-primary" />
        <div className="h-16 border-b border-ink/20 bg-ink/5" />
        <div className="h-16 border-b border-ink/20 bg-ink/5" />
        <div className="h-16 bg-ink/5" />
      </div>
    </div>
  );
}