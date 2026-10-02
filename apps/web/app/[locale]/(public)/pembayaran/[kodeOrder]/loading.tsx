/**
 * Pembayaran loading skeleton.
 * Mirror: max-w-4xl → back link + heading + instruction →
 * status banner + countdown box → grid lg:grid-cols-2 (QR | info+tombol).
 */
export default function kodeOrderLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:py-12 animate-pulse">
      {/* Back link */}
      <div className="mb-4 h-4 w-32 bg-ink/10" />

      {/* Heading + instruction */}
      <div className="h-8 w-56 bg-ink/20 mb-2" />
      <div className="h-4 w-72 max-w-full bg-ink/10 mb-8" />

      <div className="space-y-6">
        {/* Status banner (opsional) */}
        <div className="h-14 w-full bg-ink/10 border-2 border-ink" />

        {/* Countdown box — angka mono besar */}
        <div className="bg-accent/30 border-2 border-ink p-4 text-center">
          <div className="h-3 w-32 mx-auto bg-ink/15" />
          <div className="h-10 w-56 mx-auto mt-2 bg-ink/20" />
        </div>

        {/* 2 kolom: QR | info + tombol */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR card */}
          <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)]">
            <div className="h-3 w-40 mx-auto mb-3 bg-ink/15" />
            <div className="aspect-square w-full bg-primary/10 border-2 border-ink" />
            <div className="h-3 w-48 mx-auto mt-3 bg-ink/10" />
          </div>

          {/* Info boxes + aksi */}
          <div className="space-y-4">
            <div className="bg-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)]">
              <div className="h-3 w-24 bg-ink/15" />
              <div className="h-6 w-48 mt-1 bg-ink/20" />
              <div className="h-3 w-16 mt-3 bg-ink/15" />
              <div className="h-7 w-32 mt-1 bg-ink/20" />
            </div>
            <div className="bg-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)]">
              <div className="h-3 w-20 mb-2 bg-ink/15" />
              <div className="h-4 w-full bg-ink/10" />
              <div className="h-4 w-2/3 mt-1 bg-ink/10" />
              <div className="h-8 w-24 mt-2 bg-ink/10 border-2 border-ink" />
            </div>
            <div className="h-12 w-full bg-ink/15 border-2 border-ink" />
            <div className="h-4 w-48 mx-auto bg-ink/10" />
          </div>
        </div>

        <div className="h-3 w-64 mx-auto bg-ink/10" />
      </div>
    </div>
  );
}
