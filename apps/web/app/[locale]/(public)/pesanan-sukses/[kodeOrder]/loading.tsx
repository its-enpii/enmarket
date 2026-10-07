/**
 * Pesanan sukses loading skeleton.
 * Mirror: success banner card (checkmark + message) → order details card
 * (4 field 2-col) → daftar produk + lisensi/download + tombol aksi.
 */
export default function pesananSuksesLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:py-12 animate-pulse">
      {/* Success banner */}
      <div className="bg-accent/40 border-4 border-ink p-8 text-center mb-8 shadow-[6px_6px_0_0_var(--color-ink)]">
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 bg-ink/30" />
          <div className="h-4 w-40 bg-ink/20" />
        </div>
        <div className="mt-3 h-9 w-3/4 max-w-md mx-auto bg-ink/25" />
        <div className="mt-4 h-4 w-full max-w-lg mx-auto bg-ink/15" />
      </div>

      {/* Order details card — 4 field 2 kolom */}
      <div className="bg-surface border-2 border-ink p-6 mb-6 shadow-[4px_4px_0_0_var(--color-ink)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-20 bg-ink/15" />
              <div className="h-5 w-3/4 bg-ink/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Products + download/lisensi */}
      <div className="bg-surface border-2 border-ink p-6 mb-6 shadow-[4px_4px_0_0_var(--color-ink)] space-y-4">
        <div className="h-5 w-32 bg-ink/20" />
        {[0, 1].map((i) => (
          <div
            key={i}
            className="border-b-2 border-dashed border-ink/20 pb-3 last:border-b-0 last:pb-0 space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-ink/20" />
                <div className="h-3 w-24 bg-ink/10" />
              </div>
              <div className="h-5 w-20 bg-primary/20 shrink-0" />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="h-9 w-32 bg-accent/30 border-2 border-ink" />
              <div className="h-9 w-48 bg-ink/15 border-2 border-ink" />
            </div>
          </div>
        ))}
      </div>

      {/* Tombol aksi */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <div className="h-14 w-48 bg-primary/20 border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]" />
        <div className="h-14 w-48 bg-ink/10 border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]" />
      </div>
    </div>
  );
}
