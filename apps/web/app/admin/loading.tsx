/**
 * Skeleton untuk halaman beranda admin.
 * Render otomatis oleh Next.js saat navigasi via <Link> ke /admin.
 *
 * Skeleton card accent/surface palette HARUS match dengan real page
 * (tiles array di page.tsx) — agar loading→loaded tidak ada flicker warna.
 */
export default function AdminHomeLoading() {
  // Match dengan tiles order di page.tsx:
  // 1 Total Produk         → surface
  // 2 Pesanan Paid         → accent
  // 3 Pendapatan           → accent
  // 4 License Aktif        → surface
  const accentIndices = new Set([1, 2]);

  return (
    <div className="p-8 space-y-8">
      {/* Topbar real sudah di layout. Di sini cuma render content skeleton. */}
      <section>
        <div className="h-4 w-24 bg-ink/10 mb-3 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => {
            const accent = accentIndices.has(i);
            return (
              <div
                key={i}
                className={
                  'border-2 border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)] animate-pulse ' +
                  (accent ? 'bg-accent' : 'bg-surface')
                }
              >
                <div
                  className="h-3 w-3/4"
                  style={{ backgroundColor: accent ? 'rgba(4,3,3,0.25)' : 'rgba(4,3,3,0.15)' }}
                />
                <div
                  className="h-8 w-1/2 mt-3"
                  style={{ backgroundColor: accent ? 'rgba(4,3,3,0.30)' : 'rgba(4,3,3,0.20)' }}
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
