/**
 * Skeleton untuk /keranjang — match dengan real layout:
 *   1. CartHeader (PageHeader primitive: eyebrow + h1 + subtitle + actions)
 *   2. 2-col grid (7fr items | 5fr summary aside)
 *
 * Self-contained, no imports, animate-pulse at root. Pakai `mx-auto
 * max-w-screen-2xl px-6 md:px-12` inline (sama dengan PageHeader/SectionContainer
 * pattern) supaya loading.tsx tetap zero-dependency.
 */
export default function CartLoading() {
  const SC = 'mx-auto max-w-screen-2xl px-6 md:px-12';
  return (
    <div className="animate-pulse">
      {/* ───── 1. CART HEADER (PageHeader match) ───── */}
      <section className="border-b-4 border-ink">
        <div className={`${SC} py-20 md:py-28`}>
          {/* eyebrow */}
          <div className="h-3 w-28 bg-accent/40 mb-6" />
          {/* h1 */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="h-20 sm:h-28 md:h-32 w-3/5 bg-ink/15" />
            <div className="h-4 w-32 bg-ink/15" />
          </div>
          {/* subtitle */}
          <div className="mt-8 h-5 w-2/3 bg-ink/10 max-w-2xl border-l-4 border-accent pl-6" />
        </div>
      </section>

      {/* ───── 2. ITEMS (7fr) + SUMMARY (5fr) ───── */}
      <section className="border-b-4 border-ink">
        <div className={`${SC} py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-10 lg:gap-12 items-start`}>
          {/* Left column — items */}
          <div className="space-y-6">
            {/* Header strip */}
            <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
              <div className="h-3 w-32 bg-accent/40" />
              <div className="h-3 w-16 bg-ink/10" />
            </div>

            {/* 2-3 item rows */}
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] grid grid-cols-[5rem_1fr_auto] gap-4 p-4"
                >
                  {/* Thumb */}
                  <div className="aspect-square bg-primary/10 border-2 border-ink" />
                  {/* Title + price */}
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-accent/40" />
                    <div className="h-5 w-3/4 bg-ink/15" />
                    <div className="h-4 w-1/2 bg-ink/15" />
                  </div>
                  {/* Qty controls + remove */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="h-8 w-24 bg-ink/10 border-2 border-ink" />
                    <div className="h-3 w-12 bg-ink/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — summary aside */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-surface border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)] p-6 space-y-5">
              {/* Title */}
              <div className="h-4 w-32 bg-accent/40" />
              {/* Subtotal row */}
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-ink/10" />
                <div className="h-4 w-24 bg-ink/15" />
              </div>
              {/* Discount row */}
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-ink/10" />
                <div className="h-4 w-24 bg-ink/15" />
              </div>
              {/* Total */}
              <div className="border-t-2 border-ink pt-3 flex justify-between">
                <div className="h-5 w-16 bg-ink/15" />
                <div className="h-5 w-28 bg-accent/40" />
              </div>
              {/* CTA button */}
              <div className="h-12 w-full bg-primary border-2 border-ink shadow-[4px_4px_0_0_var(--color-ink)]" />
            </div>

            {/* Trust note */}
            <div className="border-2 border-ink p-4 space-y-2">
              <div className="h-3 w-32 bg-accent/40" />
              <div className="h-3 w-full bg-ink/10" />
              <div className="h-3 w-5/6 bg-ink/10" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
