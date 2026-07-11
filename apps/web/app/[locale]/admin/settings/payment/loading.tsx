/**
 * Skeleton untuk /admin/settings/payment.
 *
 * Real page: header (eyebrow + h1 + italic desc) + PaymentForm — yang
 * tersusun dari Mode indicator card + Credentials section (4 fields:
 * Merchant Code, API Key, Private Key, Mode) + Channels section (4 toggle
 * rows: QRIS, VA, E-Wallet, Convenience Store). 2 actions row.
 *
 * Override parent /admin/settings/loading.tsx yang salah render Identity
 * form skeleton.
 *
 * Container: `space-y-6` tanpa padding (parent layout supply px-6 sm:px-8
 * pt-8 pb-6).
 */
export default function PaymentSettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <header className="border-b-4 border-ink pb-6">
        <div className="h-3 w-28 bg-accent/40 mb-3" />
        <div className="h-12 sm:h-16 w-2/5 bg-ink/15 mb-3" />
        <div className="h-4 w-3/4 bg-ink/10 max-w-2xl border-l-4 border-accent pl-4" />
      </header>

      {/* ───── Mode indicator card ───── */}
      <div className="bg-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-2 w-12 bg-accent/40" />
            <div className="h-7 w-32 bg-ink/15" />
            <div className="h-3 w-3/4 bg-ink/10" />
          </div>
          <div className="shrink-0">
            <div className="h-7 w-16 bg-accent border-2 border-ink" />
          </div>
        </div>
      </div>

      {/* ───── Credentials card ───── */}
      <div className="bg-surface border-2 border-ink p-6 md:p-8 shadow-[4px_4px_0_0_var(--color-ink)] space-y-5">
        <div className="border-b-2 border-ink pb-3 mb-2">
          <div className="h-2 w-20 bg-accent/40" />
          <div className="h-5 w-40 bg-ink/15 mt-1" />
        </div>

        {/* Field 1: Merchant Code */}
        <div>
          <div className="h-3 w-24 bg-ink/10 mb-2" />
          <div className="h-10 w-full bg-ink/10 border-2 border-ink" />
        </div>

        {/* Field 2: API Key */}
        <div>
          <div className="h-3 w-20 bg-ink/10 mb-2" />
          <div className="h-10 w-full bg-ink/10 border-2 border-ink" />
        </div>

        {/* Field 3: Private Key */}
        <div>
          <div className="h-3 w-24 bg-ink/10 mb-2" />
          <div className="h-10 w-full bg-ink/10 border-2 border-ink" />
        </div>

        {/* Field 4: Mode select */}
        <div>
          <div className="h-3 w-16 bg-ink/10 mb-2" />
          <div className="h-10 w-full bg-ink/10 border-2 border-ink" />
        </div>

        {/* Actions row */}
        <div className="flex gap-2 pt-2 border-t-2 border-ink/10">
          <div className="h-10 w-40 bg-primary border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]" />
        </div>
      </div>

      {/* ───── Channels card ───── */}
      <div className="bg-surface border-2 border-ink p-6 md:p-8 shadow-[4px_4px_0_0_var(--color-ink)] space-y-5">
        <div className="border-b-2 border-ink pb-3 mb-2">
          <div className="h-2 w-20 bg-accent/40" />
          <div className="h-5 w-40 bg-ink/15 mt-1" />
        </div>

        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 border-2 border-ink bg-surface"
          >
            <div className="h-5 w-5 bg-ink/10 shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 w-24 bg-ink/15" />
              <div className="h-3 w-3/4 bg-ink/10" />
            </div>
          </div>
        ))}

        {/* Actions row */}
        <div className="flex gap-2 pt-2 border-t-2 border-ink/10">
          <div className="h-10 w-40 bg-primary border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]" />
        </div>
      </div>
    </div>
  );
}