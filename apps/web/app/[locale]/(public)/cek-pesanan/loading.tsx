/**
 * Skeleton untuk halaman cek pesanan.
 * Match dengan real page: heading + deskripsi + form card + helper text.
 */
export default function CekPesananLoading() {
  return (
    <div className="mx-auto max-w-md px-6 py-12 animate-pulse">
      {/* Heading */}
      <div className="h-10 w-48 bg-surface border-2 border-ink" />
      <div className="mt-3 h-4 w-72 bg-ink/10" />

      {/* Form card */}
      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)] mt-8">
        <div className="space-y-4">
          {/* Kode order field */}
          <div>
            <div className="h-3 w-24 bg-ink/10 mb-2" />
            <div className="h-12 w-full bg-ink/10 border-2 border-ink" />
          </div>
          {/* Email field */}
          <div>
            <div className="h-3 w-16 bg-ink/10 mb-2" />
            <div className="h-12 w-full bg-ink/10 border-2 border-ink" />
          </div>
          {/* Submit */}
          <div className="h-12 w-full bg-accent/50 border-2 border-ink mt-2" />
        </div>
      </div>

      {/* Helper text */}
      <div className="mt-6">
        <div className="h-3 w-full bg-ink/10" />
        <div className="mt-2 h-3 w-2/3 bg-ink/10" />
      </div>
    </div>
  );
}