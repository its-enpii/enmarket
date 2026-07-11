/**
 * Skeleton untuk halaman edit kategori.
 * Override parent (admin/categories/loading.tsx) yang menampilkan table — bukan form.
 */
export default function EditCategoryLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6 animate-pulse">
      {/* Header */}
      <header className="border-b-4 border-ink pb-6">
        <div className="h-3 w-28 bg-accent/40 mb-3" />
        <div className="h-12 sm:h-16 w-3/5 bg-ink/15 mb-3" />
        <div className="h-4 w-3/4 bg-ink/10 max-w-2xl border-l-4 border-accent pl-4" />
      </header>

      {/* Form card — Nama, Slug, Deskripsi */}
      <div className="bg-surface border-2 border-ink p-6 md:p-8 max-w-2xl shadow-[4px_4px_0_0_var(--color-ink)] space-y-5">
        {/* Field 1 — Nama */}
        <div>
          <div className="h-3 w-12 bg-ink/10 mb-2" />
          <div className="h-10 bg-ink/10" />
        </div>

        {/* Field 2 — Slug (mono) */}
        <div>
          <div className="h-3 w-10 bg-ink/10 mb-2" />
          <div className="h-10 bg-ink/10" />
        </div>

        {/* Field 3 — Deskripsi (textarea) */}
        <div>
          <div className="h-3 w-20 bg-ink/10 mb-2" />
          <div className="h-24 bg-ink/10" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t-2 border-ink/10">
          <div className="h-10 w-40 bg-primary border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]" />
          <div className="h-10 w-24 bg-surface border-2 border-ink" />
        </div>
      </div>
    </div>
  );
}