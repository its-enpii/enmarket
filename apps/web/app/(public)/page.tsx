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
  title: 'enpiistudio Store — Produk Digital Karya enpii',
  description:
    'Beli produk digital karya enpiistudio: source code, lisensi, dan aset siap pakai. Sekali bayar, langsung dipakai.',
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  let featuredData: Awaited<ReturnType<typeof publicApi.featuredProducts>>['data'] = [];
  let latestData: Awaited<ReturnType<typeof publicApi.latestProducts>>['data'] = [];
  let categoriesData: Awaited<ReturnType<typeof publicApi.categories>>['data'] = [];

  try {
    const [featured, latest, categories] = await Promise.all([
      publicApi.featuredProducts(),
      publicApi.latestProducts(),
      publicApi.categories(),
    ]);
    featuredData = featured.data ?? [];
    latestData = latest.data ?? [];
    categoriesData = categories.data ?? [];
  } catch (err) {
    if (!(err instanceof PublicFetchError)) throw err;
    // Frontend masih bisa render — tampilkan kosong, log warning
    console.warn('Home: gagal fetch data publik', err.message);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-12 space-y-12">
      <Hero />

      {/* Kategori chips */}
      {categoriesData.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink">Kategori</h2>
            <Link
              href="/katalog"
              className="text-sm font-bold text-primary hover:text-accent underline decoration-2 underline-offset-4"
            >
              Lihat semua →
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {categoriesData.map((cat) => (
              <Link
                key={cat.id}
                href={`/katalog?category=${cat.slug}`}
                className="bg-surface border-2 border-ink px-4 py-2 font-bold shadow-[3px_3px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--color-ink)] transition-all"
              >
                {cat.nama}
                {typeof cat.products_count === 'number' && (
                  <span className="ml-2 text-xs text-ink/60">
                    ({cat.products_count})
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section id="unggulan">
        <div className="mb-6 flex items-end justify-between gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">
            Produk Unggulan
          </h2>
        </div>
        {featuredData.length > 0 ? (
          <ProductGrid products={featuredData} />
        ) : (
          <p className="bg-surface border-2 border-ink p-6 text-center text-ink/60 shadow-[4px_4px_0_0_var(--color-ink)]">
            Belum ada produk unggulan. Tandai produk dari dashboard admin.
          </p>
        )}
      </section>

      {/* Latest */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">
            Terbaru
          </h2>
          <Link
            href="/katalog"
            className="text-sm font-bold text-primary hover:text-accent underline decoration-2 underline-offset-4"
          >
            Lihat katalog →
          </Link>
        </div>
        {latestData.length > 0 ? (
          <ProductGrid products={latestData} />
        ) : (
          <p className="bg-surface border-2 border-ink p-6 text-center text-ink/60 shadow-[4px_4px_0_0_var(--color-ink)]">
            Belum ada produk. Tambahkan dari dashboard admin.
          </p>
        )}
      </section>
    </div>
  );
}