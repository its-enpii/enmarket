export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 px-6 py-24 font-sans dark:from-zinc-950 dark:to-black">
      <div className="max-w-2xl text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          enpiistudio Store
        </p>
        <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Toko digital sedang dalam persiapan.
        </h1>
        <p className="mt-6 text-pretty text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          Segera hadir produk-produk digital enpiistudio: source code,
          lisensi, dan assets. Untuk saat ini, sistem backend &amp; frontend
          sudah berjalan — tinggal isi katalog.
        </p>

        <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          Fase 0 — Fondasi &amp; Infrastruktur
        </div>
      </div>
    </main>
  );
}