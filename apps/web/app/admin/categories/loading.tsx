/**
 * Skeleton untuk halaman daftar kategori admin.
 * Render otomatis oleh Next.js saat navigasi via <Link> ke /admin/categories.
 *
 * Topbar sudah di-handle oleh layout (sticky AdminTopbar).
 */
export default function CategoriesLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Filter bar skeleton */}
      <div className="bg-surface border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)] animate-pulse flex gap-3">
        <div className="flex-1 h-10 bg-ink/10" />
        <div className="w-24 h-10 bg-ink/10" />
        <div className="w-32 h-10 bg-ink/10 ml-auto" />
      </div>

      {/* Table skeleton — 5 kolom (nama, slug, produk, dibuat, aksi) */}
      <div className="border-2 border-ink bg-surface shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden animate-pulse">
        <div className="h-12 bg-primary" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-ink/20 flex items-center px-4 gap-4">
            <div className="h-4 bg-ink/10 flex-1 max-w-[200px]" />
            <div className="h-4 bg-ink/10 w-40" />
            <div className="h-4 bg-ink/10 w-16" />
            <div className="h-4 bg-ink/10 w-24" />
            <div className="h-8 bg-ink/10 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
