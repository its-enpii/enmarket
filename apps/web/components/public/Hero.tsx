import Link from 'next/link';

/**
 * Hero section halaman utama.
 * Pattern NeoBrutalism: blok warna primary + border ink + hard shadow.
 */
export function Hero() {
  return (
    <section className="bg-primary text-surface border-4 border-ink p-8 sm:p-12 shadow-[8px_8px_0_0_var(--color-ink)]">
      <p className="mb-3 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-accent">
        enpiistudio Store
      </p>
      <h1 className="text-balance text-4xl sm:text-6xl font-bold leading-tight tracking-tight">
        Beli produk digital
        <br />
        karya enpii.
      </h1>
      <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-surface/90">
        Source code, lisensi, dan aset digital siap pakai. Sekali bayar,
        langsung dipakai — tanpa instalasi berbelit.
      </p>
      <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 bg-accent text-ink border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_var(--color-ink)] transition-all"
        >
          Lihat Katalog →
        </Link>
        <a
          href="#unggulan"
          className="inline-flex items-center gap-2 bg-primary text-surface border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all"
        >
          Produk Unggulan
        </a>
      </div>
    </section>
  );
}