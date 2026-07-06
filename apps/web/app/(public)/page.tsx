import Link from 'next/link';

import { Hero } from '@/components/public/Hero';
import { ProductGrid } from '@/components/public/ProductGrid';
import { publicApi, PublicFetchError } from '@/lib/public-api';
import type { Metadata } from 'next';

// Force per-request rendering — build container tidak punya akses ke
// service `api` (compose DNS runtime-only). ISR tetap via webhook revalidate.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'enpiistudio — Discover, develop, display',
  description:
    'Studio kecil enpii — tempat bikin tools, menulis catatan, dan merakit source code. Beberapa dishare gratis, beberapa dijual.',
  alternates: { canonical: '/' },
};

// Placeholder statis untuk section Discover. Nanti bisa diganti dengan fetch
// ke endpoint blog/catatan kalau sudah ada CMS atau feed eksternal.
const RECENT_EXPERIMENTS = [
  {
    title: 'Membangun CLI generator dalam Rust — catatan & benchmark',
    excerpt:
      'Eksperimen kecil membandingkan waktu kompilasi dan runtime vs pendekatan Node. Hasilnya? Trade-off yang menarik untuk tool internal.',
    href: '#',
  },
  {
    title: 'Container queries di production — catatan migrasi',
    excerpt:
      'Refactor komponen dashboard dari media-query berat ke container query. Lebih bersih, tapi ada jebakan yang tidak dokumentasinya sebutkan.',
    href: '#',
  },
];

export default async function HomePage() {
  let featuredData: Awaited<ReturnType<typeof publicApi.featuredProducts>>['data'] = [];
  let developData: Awaited<ReturnType<typeof publicApi.productsByType>>['data'] = [];

  try {
    const [featured, develop] = await Promise.all([
      publicApi.featuredProducts(),
      publicApi.productsByType({ tipe: 'download', per_page: 3 }),
    ]);
    featuredData = featured.data ?? [];
    developData = develop.data ?? [];
  } catch (err) {
    if (!(err instanceof PublicFetchError)) throw err;
    console.warn('Home: gagal fetch data publik', err.message);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-12 space-y-16 sm:space-y-20">
      <Hero />

      {/* Tagline strip — anchor visual untuk tiga pilar */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-primary">
          Discover
        </span>
        <span className="text-ink/30">·</span>
        <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-primary">
          Develop
        </span>
        <span className="text-ink/30">·</span>
        <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-primary">
          Display
        </span>
      </div>

      {/* Discover — catatan & eksperimen */}
      <section id="discover" className="space-y-4">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-bold text-primary font-mono">01</span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink leading-tight">Discover</h2>
            <p className="text-sm sm:text-base text-ink/70 mt-1">
              Hal-hal yang lagi kupelajari, eksperimen, dan tulis di catatan pribadi.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {RECENT_EXPERIMENTS.map((exp) => (
            <a
              key={exp.title}
              href={exp.href}
              className="group block bg-surface border-2 border-ink p-5 shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_var(--color-ink)] transition-all"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-2">
                Eksperimen
              </p>
              <h3 className="text-lg font-bold text-ink leading-snug group-hover:text-primary transition-colors">
                {exp.title}
              </h3>
              <p className="mt-2 text-sm text-ink/70 leading-relaxed line-clamp-3">
                {exp.excerpt}
              </p>
              <p className="mt-3 text-xs font-bold text-primary">Baca catatan →</p>
            </a>
          ))}
        </div>
      </section>

      {/* Develop — source code, library, tools */}
      <section id="develop" className="space-y-4">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-bold text-primary font-mono">02</span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink leading-tight">Develop</h2>
            <p className="text-sm sm:text-base text-ink/70 mt-1">
              Source code & tools yang kupakai sehari-hari. Sekali bayar, langsung unduh.
            </p>
          </div>
        </div>
        {developData.length > 0 ? (
          <ProductGrid products={developData} />
        ) : (
          <p className="bg-surface border-2 border-ink p-6 text-center text-ink/60 shadow-[4px_4px_0_0_var(--color-ink)]">
            Belum ada source code yang dipublikasi. Tandai produk bertipe &ldquo;download&rdquo;
            dari dashboard admin.
          </p>
        )}
        {developData.length > 0 && (
          <div className="pt-2">
            <Link
              href="/katalog?tipe=download"
              className="text-sm font-bold text-primary hover:text-accent underline decoration-2 underline-offset-4"
            >
              Lihat semua source code →
            </Link>
          </div>
        )}
      </section>

      {/* Display — karya jadi, lisensi, bundle */}
      <section id="display" className="space-y-4">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-bold text-primary font-mono">03</span>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink leading-tight">Display</h2>
            <p className="text-sm sm:text-base text-ink/70 mt-1">
              Karya yang sudah jadi — lisensi, bundle, hasil akhir dari eksperimen studio.
            </p>
          </div>
        </div>
        {featuredData.length > 0 ? (
          <ProductGrid products={featuredData} />
        ) : (
          <p className="bg-surface border-2 border-ink p-6 text-center text-ink/60 shadow-[4px_4px_0_0_var(--color-ink)]">
            Belum ada karya pilihan. Tandai produk dari dashboard admin.
          </p>
        )}
        {featuredData.length > 0 && (
          <div className="pt-2">
            <Link
              href="/katalog"
              className="text-sm font-bold text-primary hover:text-accent underline decoration-2 underline-offset-4"
            >
              Lihat semua karya →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}