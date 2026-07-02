export default function Home() {
  return (
    <main className="min-h-screen bg-surface text-ink flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-surface border-4 border-ink p-8 shadow-[8px_8px_0_0_var(--color-ink)]">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-primary">
            enpiistudio Store
          </p>
          <h1 className="text-balance text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-ink">
            Toko digital sedang dalam persiapan.
          </h1>
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-ink/80">
            Segera hadir produk-produk digital enpiistudio: source code,
            lisensi, dan assets. Untuk saat ini, sistem backend &amp;
            frontend sudah berjalan.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/login"
              className="inline-flex items-center gap-2 bg-primary text-surface border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_var(--color-ink)] transition-all"
            >
              Login Admin →
            </a>
            <span className="inline-flex items-center gap-2 bg-accent text-ink border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ink"></span>
              </span>
              Fase 0 — Fondasi
            </span>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink/60">
          © enpiistudio — Self-hosted digital store
        </p>
      </div>
    </main>
  );
}