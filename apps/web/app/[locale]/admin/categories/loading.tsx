/**
 * Skeleton untuk halaman daftar kategori admin.
 * Render otomatis oleh Next.js saat navigasi via <Link> ke /admin/categories.
 *
 * Topbar sudah di-handle oleh layout (sticky AdminTopbar).
 */
export default function CategoriesLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6 animate-pulse">
      {/* Header */}
      <header className="border-b-4 border-ink pb-6">
        <div className="h-3 w-28 bg-accent/40 mb-3" />
        <div className="h-12 sm:h-16 w-1/2 bg-ink/15 mb-3" />
        <div className="h-4 w-3/4 bg-ink/10 max-w-2xl border-l-4 border-accent pl-4" />
      </header>

      {/* Filter bar (search + action) */}
      <div className="bg-surface border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)] flex gap-3">
        <div className="flex-1 h-10 bg-ink/10" />
        <div className="w-32 h-10 bg-primary border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)] ml-auto" />
      </div>

      {/* Table — 5 kolom (nama, slug, produk, dibuat, aksi) */}
      <div className="border-2 border-ink bg-surface shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden">
        <div className="h-12 bg-primary/40" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-ink/20 flex items-center px-4 gap-4">
            <div className="h-4 bg-ink/15 flex-1 max-w-[200px]" />
            <div className="h-6 bg-ink/10 w-40 font-mono border-2 border-ink" />
            <div className="h-4 bg-ink/10 w-16" />
            <div className="h-4 bg-ink/10 w-24" />
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-ink/15" />
              <div className="h-8 w-8 bg-accent/40 border-2 border-ink" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}