/**
 * Skeleton untuk halaman beranda admin (/admin).
 * Render otomatis oleh Next.js saat navigasi via <Link> ke /admin.
 *
 * Skeleton HARUS mirror struktur real page.tsx (p-6 sm:p-8 space-y-8):
 *   1. Header (eyebrow + h1 + italic desc)
 *   2. 6 stat tiles (SURF | ACCENT | PRIMARY | ACCENT | PRIMARY | SURF)
 *   3. Pending Orders + Recent Activity (2-col grid, each panel: title bar + 4-5 rows)
 *   4. Quick action buttons (4)
 */
export default function AdminHomeLoading() {
  // Tile color rhythm from page.tsx tiles array.
  const tileTones = ['surface', 'accent', 'primary', 'accent', 'primary', 'surface'] as const;

  // Panel rows — 4 (pending) + 5 (activity).
  const pendingRows = 4;
  const activityRows = 5;

  return (
    <div className="p-6 sm:p-8 space-y-8 animate-pulse">
      {/* ───── HEADER ───── */}
      <header className="border-b-4 border-ink pb-6">
        <div className="h-4 w-32 bg-accent/40 mb-3" />
        <div className="h-12 sm:h-16 w-3/4 bg-ink/15 mb-4" />
        <div className="h-4 w-2/3 bg-ink/10 max-w-2xl border-l-4 border-accent pl-4" />
      </header>

      {/* ───── STAT TILES (6) ───── */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {tileTones.map((tone, i) => {
            const isAccent = tone === 'accent';
            const isPrimary = tone === 'primary';
            const labelBg = isAccent
              ? 'bg-ink/25'
              : isPrimary
                ? 'bg-surface/40'
                : 'bg-ink/15';
            const valueBg = isAccent
              ? 'bg-ink/30'
              : isPrimary
                ? 'bg-surface/60'
                : 'bg-ink/20';
            const tileBg = isAccent
              ? 'bg-accent'
              : isPrimary
                ? 'bg-primary'
                : 'bg-surface';
            return (
              <div
                key={i}
                className={`${tileBg} border-2 border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)]`}
              >
                <div className={`h-3 w-3/4 ${labelBg}`} />
                <div className={`h-8 w-1/2 mt-3 ${valueBg}`} />
              </div>
            );
          })}
        </div>
      </section>

      {/* ───── PENDING ORDERS + RECENT ACTIVITY (2-col) ───── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending orders panel */}
        <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)]">
          <div className="flex items-baseline justify-between mb-4 border-b-2 border-ink pb-3">
            <div>
              <div className="h-2 w-20 bg-accent/40" />
              <div className="h-5 w-32 bg-ink/15 mt-1" />
            </div>
            <div className="h-3 w-12 bg-ink/10" />
          </div>
          <ul className="space-y-2">
            {Array.from({ length: pendingRows }).map((_, i) => (
              <li
                key={i}
                className="p-3 border-2 border-ink bg-surface flex gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-2/3 bg-ink/15 truncate" />
                  <div className="h-3 w-20 bg-ink/10 mt-1" />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent activity panel */}
        <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)]">
          <div className="flex items-baseline justify-between mb-4 border-b-2 border-ink pb-3">
            <div>
              <div className="h-2 w-20 bg-accent/40" />
              <div className="h-5 w-32 bg-ink/15 mt-1" />
            </div>
            <div className="h-3 w-12 bg-ink/10" />
          </div>
          <ul className="space-y-2">
            {Array.from({ length: activityRows }).map((_, i) => (
              <li
                key={i}
                className="p-3 border-2 border-ink bg-surface flex gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-2/3 bg-ink/15 truncate" />
                  <div className="h-3 w-20 bg-ink/10 mt-1" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── QUICK SHORTCUTS (4) ───── */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="h-12 bg-primary border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]" />
          <div className="h-12 bg-primary border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]" />
          <div className="h-12 bg-accent border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]" />
          <div className="h-12 bg-surface border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]" />
        </div>
      </section>
    </div>
  );
}