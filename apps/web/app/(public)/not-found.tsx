import Link from 'next/link';

/**
 * 404 publik — dipanggil dari notFound() di Server Component publik.
 */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24 text-center">
      <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-ink/60">
        404 — Halaman Tidak Ditemukan
      </p>
      <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight text-ink">
        Waduh, halaman ini nggak ada.
      </h1>
      <p className="mt-4 text-base sm:text-lg text-ink/70">
        Mungkin produk yang kamu cari sudah dihapus atau slug-nya berubah.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/katalog"
          className="inline-block bg-primary text-surface border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all"
        >
          ← Lihat Katalog
        </Link>
        <Link
          href="/"
          className="inline-block bg-surface text-ink border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all"
        >
          Beranda
        </Link>
      </div>
    </div>
  );
}