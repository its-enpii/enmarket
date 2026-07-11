/**
 * Skeleton untuk halaman login admin.
 * Match dengan real page: centered card dengan heading + deskripsi + form (token + submit) + footer link.
 */
export default function LoginLoading() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-pulse">
        <div className="bg-surface border-4 border-ink p-8 shadow-[8px_8px_0_0_var(--color-ink)]">
          {/* Eyebrow */}
          <div className="h-3 w-32 bg-primary/40 mb-3" />
          {/* Heading */}
          <div className="h-9 w-56 bg-surface border-2 border-ink" />
          {/* Subtitle */}
          <div className="mt-3 h-4 w-64 bg-ink/10" />

          {/* Form */}
          <div className="mt-8 space-y-5">
            {/* Token field */}
            <div>
              <div className="h-3 w-24 bg-ink/10 mb-2" />
              <div className="h-12 w-full bg-ink/10 border-2 border-ink" />
            </div>
            {/* Submit */}
            <div className="h-12 w-full bg-accent/50 border-2 border-ink" />
          </div>
        </div>

        {/* Footer link */}
        <div className="mt-6 flex justify-center">
          <div className="h-4 w-40 bg-ink/10" />
        </div>
      </div>
    </main>
  );
}