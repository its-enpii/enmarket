/**
 * Skeleton untuk halaman media library admin.
 * Render otomatis oleh Next.js saat navigasi via <Link> ke /admin/media.
 *
 * Mirror real page: header (eyebrow + h1 "Media." + italic desc, optional
 * Picker Mode badge) + filter bar (search + source + type + count) + grid of
 * 2/3/4-kolom media cards (aspect-square preview + filename + source label).
 *
 * Topbar sudah di-handle oleh layout (sticky AdminTopbar), jadi di sini
 * cuma render content skeleton.
 */
export default function MediaLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6 animate-pulse">
      {/* Header */}
      <header className="border-b-4 border-ink pb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="h-3 w-28 bg-accent/40 mb-3" />
            <div className="h-12 sm:h-16 w-1/2 bg-ink/15 mb-3" />
            <div className="h-4 w-3/4 bg-ink/10 max-w-2xl border-l-4 border-accent pl-4" />
          </div>
        </div>
      </header>

      {/* Filter bar — search + 2 select filters + count label */}
      <div className="bg-surface border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)] flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] h-10 bg-ink/10" />
        <div className="w-44 h-10 bg-ink/10" />
        <div className="w-44 h-10 bg-ink/10" />
        <div className="ml-auto self-end w-28 h-10 bg-ink/10" />
      </div>

      {/* Gallery grid — 2/3/4 kolom cards dengan aspect-square preview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden"
          >
            {/* Preview (aspect-square) */}
            <div className="aspect-square bg-ink/15 border-b-2 border-ink relative">
              {/* Source badge skeleton */}
              <div className="absolute top-2 left-2 w-16 h-5 bg-accent/50 border-2 border-ink" />
            </div>
            {/* Info */}
            <div className="p-3 space-y-2">
              <div className="h-3 bg-ink/15 w-3/4" />
              <div className="h-3 bg-ink/10 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
