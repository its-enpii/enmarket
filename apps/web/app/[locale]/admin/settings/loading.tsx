/**
 * Skeleton untuk halaman pengaturan (settings).
 * Override parent (admin/loading.tsx) yang menampilkan 6 tiles — bukan form cards.
 *
 * Real page: header (eyebrow + h1 + italic desc) + IdentityForm (3 sub-sections:
 * Identity, Social, Footer). Skeleton mirror Identity section only — 3 fields
 * (Nama Studio, Tagline, Logo upload) + actions row.
 *
 * Container matches real page: `space-y-6` tanpa padding (layout sudah
 * supply px-6 sm:px-8 pt-8 pb-6).
 */
export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <header className="border-b-4 border-ink pb-6">
        <div className="h-3 w-28 bg-accent/40 mb-3" />
        <div className="h-12 sm:h-16 w-2/5 bg-ink/15 mb-3" />
        <div className="h-4 w-3/4 bg-ink/10 max-w-2xl border-l-4 border-accent pl-4" />
      </header>

      {/* ───── Identity card ───── */}
      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] space-y-5">
        <div className="border-b-2 border-ink pb-3">
          <div className="h-2 w-20 bg-accent/40" />
          <div className="h-5 w-32 bg-ink/15 mt-1" />
        </div>

        {/* Field 1: Nama Studio */}
        <div>
          <div className="h-3 w-28 bg-ink/10 mb-2" />
          <div className="h-10 w-full bg-ink/10 border-2 border-ink" />
        </div>

        {/* Field 2: Tagline */}
        <div>
          <div className="h-3 w-20 bg-ink/10 mb-2" />
          <div className="h-10 w-full bg-ink/10 border-2 border-ink" />
        </div>

        {/* Field 3: Logo upload */}
        <div>
          <div className="h-3 w-24 bg-ink/10 mb-2" />
          <div className="h-20 w-full bg-ink/10 border-2 border-ink" />
        </div>

        {/* Actions row */}
        <div className="flex gap-2 pt-2 border-t-2 border-ink">
          <div className="h-10 w-44 bg-primary border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]" />
        </div>
      </div>

      {/* ───── Social Section card ───── */}
      <div className="bg-surface border-2 border-ink p-6 md:p-8 shadow-[4px_4px_0_0_var(--color-ink)] space-y-5">
        <div className="border-b-2 border-ink pb-3 mb-2">
          <div className="h-2 w-20 bg-accent/40" />
          <div className="h-5 w-40 bg-ink/15 mt-1" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 bg-ink/10 mb-2" />
            <div className="flex gap-2">
              <div className="h-10 flex-1 bg-ink/10" />
              <div className="h-10 w-10 bg-accent/40 border-2 border-ink" />
            </div>
          </div>
        ))}
        <div className="flex gap-3 pt-2 border-t-2 border-ink/10">
          <div className="h-10 w-32 bg-surface border-2 border-ink" />
          <div className="h-10 w-24 bg-primary border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)] ml-auto" />
        </div>
      </div>

      {/* ───── Footer Section card ───── */}
      <div className="bg-surface border-2 border-ink p-6 md:p-8 shadow-[4px_4px_0_0_var(--color-ink)] space-y-5">
        <div className="border-b-2 border-ink pb-3 mb-2">
          <div className="h-2 w-20 bg-accent/40" />
          <div className="h-5 w-40 bg-ink/15 mt-1" />
        </div>
        <div>
          <div className="h-3 w-24 bg-ink/10 mb-2" />
          <div className="h-24 bg-ink/10" />
        </div>
        <div className="flex gap-3 pt-2 border-t-2 border-ink/10">
          <div className="h-10 w-32 bg-primary border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]" />
        </div>
      </div>
    </div>
  );
}