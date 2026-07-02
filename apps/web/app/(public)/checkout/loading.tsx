/**
 * Skeleton untuk halaman checkout.
 */
export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8 sm:py-12">
      <div className="h-10 w-48 bg-surface border-2 border-ink animate-pulse shadow-[3px_3px_0_0_var(--color-ink)] mb-6" />

      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-3 w-20 bg-ink/10 mb-2" />
            <div className="h-12 w-full bg-ink/10 border-2 border-ink" />
          </div>
        ))}
        <div className="h-12 w-full bg-accent/50 border-2 border-ink mt-6" />
      </div>
    </div>
  );
}