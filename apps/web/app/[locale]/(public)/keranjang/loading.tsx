/**
 * Skeleton loader untuk halaman keranjang (Cart).
 *
 * Match real page structure (full-bleed, NO max-w):
 *   1. Header section (border-b-4, px-6 md:px-12 py-16 md:py-20) — eyebrow +
 *      h1 + back link + italic body
 *   2. Two-column section — LEFT (items list, 3 cards) + RIGHT (sticky
 *      SummaryBlock primary + TrustNote)
 */

function CartItemCardSkeleton() {
  return (
    <article className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="shrink-0 w-full sm:w-32 sm:h-32 aspect-video sm:aspect-square border-b-2 sm:border-b-0 sm:border-r-2 border-ink bg-primary/10" />

        {/* Info panel */}
        <div className="flex-1 min-w-0 p-4 sm:p-5 space-y-3">
          {/* Top row — title + gold price tag */}
          <div className="flex items-start justify-between gap-4">
            <div className="h-5 w-2/3 bg-ink/15" />
            <div className="shrink-0 h-7 w-20 bg-accent/50 border-2 border-ink" />
          </div>

          {/* Subtotal row */}
          <div className="flex items-baseline gap-2 border-l-2 border-ink/20 pl-3">
            <div className="h-3 w-12 bg-ink/10" />
            <div className="h-5 w-24 bg-ink/20" />
          </div>

          {/* Bottom row — qty controls + remove */}
          <div className="flex items-center gap-3 pt-2 border-t-2 border-ink/10">
            <div className="h-8 w-8 bg-ink/15 border-2 border-ink" />
            <div className="h-8 w-10 bg-ink/15 border-2 border-ink" />
            <div className="h-8 w-8 bg-ink/15 border-2 border-ink" />
            <div className="ml-auto h-8 w-8 bg-ink/15 border-2 border-ink" />
          </div>
        </div>
      </div>
    </article>
  );
}

function SummaryBlockSkeleton() {
  return (
    <aside className="bg-primary text-surface border-4 border-ink shadow-[8px_8px_0_0_var(--color-ink)]">
      <div className="p-6 md:p-8 space-y-5">
        {/* Eyebrow label */}
        <div className="h-3 w-32 bg-surface/40" />

        {/* 3 line items (subtotal, discount, ongkir) */}
        <div className="space-y-4 border-b border-surface/20 pb-3">
          <div className="flex justify-between">
            <div className="h-3 w-24 bg-surface/40" />
            <div className="h-3 w-16 bg-surface/40" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 w-24 bg-surface/40" />
            <div className="h-3 w-16 bg-surface/40" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 w-24 bg-surface/40" />
            <div className="h-3 w-16 bg-surface/40" />
          </div>
        </div>

        {/* Total — gold block */}
        <div className="pt-2">
          <div className="h-3 w-16 bg-surface/40 mb-2" />
          <div className="inline-flex items-center bg-accent border-2 border-ink h-12 w-44" />
          <div className="mt-3 h-2 w-32 bg-surface/40" />
        </div>

        {/* CTA */}
        <div className="h-14 w-full bg-surface border-4 border-ink shadow-[6px_6px_0_0_var(--color-accent)]" />

        {/* Small note */}
        <div className="h-3 w-40 bg-surface/40 mx-auto" />
      </div>
    </aside>
  );
}

function TrustNoteSkeleton() {
  return (
    <div className="mt-6 border-2 border-ink bg-surface p-5 shadow-[4px_4px_0_0_var(--color-ink)]">
      <div className="h-2 w-24 bg-accent/40 mb-2" />
      <div className="h-5 w-3/4 bg-ink/15" />
      <div className="mt-3 space-y-2">
        <div className="h-2 w-full bg-ink/10" />
        <div className="h-2 w-5/6 bg-ink/10" />
      </div>
    </div>
  );
}

export default function KeranjangLoading() {
  return (
    <div className="animate-pulse">
      {/* ───── 1. HEADER ───── */}
      <section className="border-b-4 border-ink">
        <div className="px-6 md:px-12 py-16 md:py-20">
          {/* Eyebrow */}
          <div className="h-3 w-32 bg-accent/40 mb-6" />

          {/* Title row */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="h-16 sm:h-24 w-3/4 bg-primary/40" />
              <div className="h-16 sm:h-24 w-1/2 bg-primary/40" />
            </div>
            <div className="hidden lg:block h-4 w-40 bg-ink/10" />
          </div>

          {/* Italic body */}
          <div className="mt-8 h-5 w-2/3 bg-ink/10 max-w-2xl border-l-4 border-accent pl-6" />
        </div>
      </section>

      {/* ───── 2. TWO-COLUMN LAYOUT ───── */}
      <section className="border-b-4 border-ink">
        <div className="px-6 md:px-12 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-10 lg:gap-12 items-start">
          {/* LEFT — items list */}
          <div className="space-y-6">
            <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
              <div className="h-4 w-40 bg-ink/10" />
              <div className="h-3 w-16 bg-ink/10" />
            </div>

            <div className="space-y-5">
              <CartItemCardSkeleton />
              <CartItemCardSkeleton />
              <CartItemCardSkeleton />
            </div>
          </div>

          {/* RIGHT — sticky summary */}
          <div className="lg:sticky lg:top-24">
            <SummaryBlockSkeleton />
            <TrustNoteSkeleton />
          </div>
        </div>
      </section>
    </div>
  );
}