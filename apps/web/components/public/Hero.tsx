import Link from 'next/link';

/**
 * Hero section halaman utama.
 * Tone: studio (bukan marketplace). Tagline 3 kata jadi anchor brand.
 */
export function Hero() {
  return (
    <section className="bg-primary text-surface border-4 border-ink p-8 sm:p-12 shadow-[8px_8px_0_0_var(--color-ink)]">
      <p className="mb-3 text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-accent">
        enpiistudio
      </p>
      <h1 className="text-balance text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
        Discover,
        <br />
        develop,
        <br />
        display.
      </h1>
      <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-surface/90">
        Studio kecil enpii — tempat aku bikin tools, menulis catatan, dan merakit
        source code. Sebagian dishare gratis, sebagian dijual supaya studionya tetap jalan.
      </p>
      <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 bg-accent text-ink border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_var(--color-ink)] transition-all"
        >
          Lihat Karya →
        </Link>
        <a
          href="#develop"
          className="inline-flex items-center gap-2 bg-primary text-surface border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all"
        >
          Mulai dari Develop
        </a>
      </div>
    </section>
  );
}