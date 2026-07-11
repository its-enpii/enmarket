/**
 * Skeleton untuk halaman tambah produk.
 * Override parent (admin/products/loading.tsx) yang menampilkan table — bukan form.
 *
 * Self-contained: form pages butuh layout spesifik (header + form card + actions)
 * yang beda dari list. Tidak reuse PageFormLoading.
 */
export default function NewProductLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6 animate-pulse">
      {/* Header */}
      <header className="border-b-4 border-ink pb-6">
        <div className="h-3 w-28 bg-accent/40 mb-3" />
        <div className="h-12 sm:h-16 w-2/3 bg-ink/15 mb-3" />
        <div className="h-4 w-3/4 bg-ink/10 max-w-2xl border-l-4 border-accent pl-4" />
      </header>

      {/* Form card — 8 field rows + 1 textarea (deskripsi) + 1 short area (fitur) + 1 file upload + actions */}
      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] space-y-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="h-3 w-24 bg-ink/10 mb-2" />
            <div className="h-10 bg-ink/10" />
          </div>
        ))}

        {/* Deskripsi (large textarea) */}
        <div>
          <div className="h-3 w-32 bg-ink/10 mb-2" />
          <div className="h-24 bg-ink/10" />
        </div>

        {/* Fitur (short textarea area) */}
        <div>
          <div className="h-3 w-28 bg-ink/10 mb-2" />
          <div className="h-16 bg-ink/10" />
        </div>

        {/* File upload block */}
        <div>
          <div className="h-3 w-24 bg-ink/10 mb-2" />
          <div className="h-16 bg-ink/10 border-2 border-ink" />
        </div>

        {/* Actions row */}
        <div className="flex gap-2 pt-2 border-t-2 border-ink/10">
          <div className="h-10 w-40 bg-primary border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]" />
          <div className="h-10 w-24 bg-surface border-2 border-ink" />
        </div>
      </div>
    </div>
  );
}
