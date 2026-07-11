/**
 * Skeleton untuk halaman tambah catatan (post baru).
 * Override parent (admin/posts/loading.tsx) yang menampilkan table — bukan form.
 *
 * Real page: header (eyebrow + h1 + italic desc) + Card surface with PostForm.
 * PostForm memiliki 7 field: judul, slug, excerpt (short textarea),
 * konten (large textarea via Tiptap), thumbnail (file), status (select), tanggal publish.
 */
export default function NewPostLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6 animate-pulse">
      {/* Header */}
      <header className="border-b-4 border-ink pb-6">
        <div className="h-3 w-28 bg-accent/40 mb-3" />
        <div className="h-12 sm:h-16 w-3/5 bg-ink/15 mb-3" />
        <div className="h-4 w-3/4 bg-ink/10 max-w-2xl border-l-4 border-accent pl-4" />
      </header>

      {/* Form card — 6 field rows + 1 short textarea (excerpt) + 1 large textarea (konten) + 1 file upload + actions */}
      <div className="bg-surface border-2 border-ink p-6 md:p-8 shadow-[4px_4px_0_0_var(--color-ink)] space-y-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="h-3 w-20 bg-ink/10 mb-2" />
            <div className="h-10 bg-ink/10" />
          </div>
        ))}

        {/* Excerpt (short textarea) */}
        <div>
          <div className="h-3 w-20 bg-ink/10 mb-2" />
          <div className="h-16 bg-ink/10" />
        </div>

        {/* Konten (large textarea) */}
        <div>
          <div className="h-3 w-20 bg-ink/10 mb-2" />
          <div className="h-40 bg-ink/10" />
        </div>

        {/* File upload block */}
        <div>
          <div className="h-3 w-20 bg-ink/10 mb-2" />
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