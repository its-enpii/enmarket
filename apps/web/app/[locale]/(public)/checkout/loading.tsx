/**
 * Checkout loading skeleton.
 * Mirror: max-w-4xl px-6 py-8 → heading (border-b-4) →
 * grid lg:grid-cols-[1fr_22rem] gap-8 (form card | ringkasan bg-primary) + back link.
 */
export default function checkoutLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:py-12 animate-pulse">
      {/* Header */}
      <div className="mb-8 border-b-4 border-ink pb-6">
        <div className="h-4 w-28 bg-accent/40 mb-3" />
        <div className="h-10 w-64 max-w-full bg-ink/20" />
        <div className="mt-3 h-4 w-80 max-w-full bg-ink/10" />
      </div>

      {/* 2 kolom: form | ringkasan */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-8">
        {/* Form card */}
        <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] space-y-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-ink/15" />
              <div className="h-12 w-full bg-ink/10 border-2 border-ink" />
            </div>
          ))}
          <div className="h-12 w-40 bg-primary/20 border-2 border-ink" />
        </div>

        {/* Ringkasan — bg-primary */}
        <div className="bg-primary/20 border-2 border-ink p-5 h-fit shadow-[4px_4px_0_0_var(--color-ink)] space-y-3">
          <div className="h-4 w-28 bg-accent/40 border-b border-surface/30 pb-2" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex justify-between gap-2 border-b border-surface/10 pb-2">
              <div className="h-4 w-32 bg-surface/40" />
              <div className="h-4 w-12 bg-surface/40" />
            </div>
          ))}
          <div className="border-t-2 border-surface/30 pt-3 space-y-1">
            <div className="h-3 w-16 bg-surface/30" />
            <div className="h-8 w-32 bg-surface/40" />
          </div>
          <div className="h-3 w-full bg-surface/30 mt-4 border-t border-surface/20 pt-3" />
        </div>
      </div>

      {/* Back link */}
      <div className="mt-6 h-4 w-40 mx-auto bg-ink/10" />
    </div>
  );
}
