/**
 * Cek pesanan loading skeleton.
 * Mirror: max-w-md px-6 py-12 → h1 + subtitle → form card
 * (input kode order + input email + submit button) + helper text.
 */
export default function cekPesananLoading() {
  return (
    <div className="mx-auto max-w-md px-6 py-12 animate-pulse">
      <div className="h-9 w-56 bg-ink/20 mb-3" />
      <div className="h-4 w-full max-w-sm bg-ink/10 mb-8" />

      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] space-y-5">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 bg-ink/15" />
            <div className="h-12 w-full bg-ink/10 border-2 border-ink" />
          </div>
        ))}
        <div className="h-12 w-full bg-primary/20 border-2 border-ink" />
        <div className="h-3 w-4/5 bg-ink/10 pt-2" />
      </div>
    </div>
  );
}
