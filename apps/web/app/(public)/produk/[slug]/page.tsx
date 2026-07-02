import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { ImageGallery } from '@/components/public/ImageGallery';
import { PriceTag } from '@/components/public/PriceTag';
import { formatDate, TIPE_LABEL } from '@/lib/format';
import { publicApi, PublicFetchError } from '@/lib/public-api';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const res = await publicApi.product(slug);
    return res.data;
  } catch (err) {
    if (err instanceof PublicFetchError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) {
    return {
      title: 'Produk tidak ditemukan — enpiistudio Store',
      robots: { index: false },
    };
  }

  const description = product.deskripsi
    ? product.deskripsi.slice(0, 160)
    : `${product.nama} — ${TIPE_LABEL[product.tipe] ?? product.tipe}`;

  const ogImage = product.preview_images?.[0];

  return {
    title: `${product.nama} — enpiistudio Store`,
    description,
    keywords: [product.nama, product.category?.nama ?? '', TIPE_LABEL[product.tipe] ?? product.tipe].filter(Boolean),
    alternates: { canonical: `/produk/${product.slug}` },
    openGraph: {
      title: product.nama,
      description,
      type: 'website',
      url: `/produk/${product.slug}`,
      ...(ogImage ? { images: [{ url: ogImage, alt: product.nama }] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: product.nama,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  const kategori = product.category;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <Link href="/" className="text-ink/60 hover:text-primary font-bold">
          Beranda
        </Link>
        <span className="text-ink/40">/</span>
        <Link href="/katalog" className="text-ink/60 hover:text-primary font-bold">
          Katalog
        </Link>
        {kategori && (
          <>
            <span className="text-ink/40">/</span>
            <Link
              href={`/katalog?category=${kategori.slug}`}
              className="text-ink/60 hover:text-primary font-bold"
            >
              {kategori.nama}
            </Link>
          </>
        )}
        <span className="text-ink/40">/</span>
        <span className="text-ink font-bold truncate max-w-[16rem]">{product.nama}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <ImageGallery images={product.preview_images ?? []} alt={product.nama} />

        {/* Info panel */}
        <div>
          {product.is_featured && (
            <span className="inline-block bg-accent text-ink border-2 border-ink px-2 py-0.5 text-xs font-bold uppercase tracking-wider mb-3">
              Unggulan
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-ink">
            {product.nama}
          </h1>

          <div className="mt-4">
            <PriceTag value={product.harga} size="lg" />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="bg-ink text-surface border-2 border-ink px-3 py-1 text-xs font-bold uppercase tracking-wider">
              {TIPE_LABEL[product.tipe] ?? product.tipe}
            </span>
            {product.has_downloadable_file && (
              <span className="bg-primary text-surface border-2 border-ink px-3 py-1 text-xs font-bold uppercase tracking-wider">
                File Download
              </span>
            )}
            {product.needs_license_key && (
              <span className="bg-accent text-ink border-2 border-ink px-3 py-1 text-xs font-bold uppercase tracking-wider">
                License Key
              </span>
            )}
          </div>

          {/* Beli — disabled, badge coming soon */}
          <div className="mt-8">
            <button
              type="button"
              disabled
              className="w-full sm:w-auto bg-ink/40 text-surface border-2 border-ink px-6 py-4 font-bold text-base cursor-not-allowed"
              aria-disabled
            >
              Beli Sekarang →
              <span className="block text-xs font-normal mt-1 opacity-80">
                Coming soon — Fase 3
              </span>
            </button>
          </div>

          {/* Fitur */}
          {product.fitur && product.fitur.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-ink mb-3">Yang kamu dapat</h2>
              <ul className="space-y-2">
                {product.fitur.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 bg-surface border-2 border-ink px-3 py-2 shadow-[2px_2px_0_0_var(--color-ink)]"
                  >
                    <span className="text-primary font-bold mt-0.5">→</span>
                    <span className="text-sm text-ink">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Deskripsi */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-ink mb-4">Tentang produk ini</h2>
        <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)]">
          {product.deskripsi
            .split(/\r?\n/)
            .filter((p) => p.trim() !== '')
            .map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-ink/80 mb-3 last:mb-0">
                {p}
              </p>
            ))}
        </div>
      </div>

      {/* Meta info */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kategori && (
          <div className="bg-surface border-2 border-ink p-3 shadow-[2px_2px_0_0_var(--color-ink)]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink/60">
              Kategori
            </p>
            <Link
              href={`/katalog?category=${kategori.slug}`}
              className="mt-1 block text-sm font-bold text-primary hover:text-accent"
            >
              {kategori.nama}
            </Link>
          </div>
        )}
        <div className="bg-surface border-2 border-ink p-3 shadow-[2px_2px_0_0_var(--color-ink)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink/60">
            Tipe
          </p>
          <p className="mt-1 text-sm font-bold text-ink">
            {TIPE_LABEL[product.tipe] ?? product.tipe}
          </p>
        </div>
        {product.download_expiry_days && (
          <div className="bg-surface border-2 border-ink p-3 shadow-[2px_2px_0_0_var(--color-ink)]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink/60">
              Masa Download
            </p>
            <p className="mt-1 text-sm font-bold text-ink">
              {product.download_expiry_days} hari
            </p>
          </div>
        )}
        <div className="bg-surface border-2 border-ink p-3 shadow-[2px_2px_0_0_var(--color-ink)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink/60">
            Diperbarui
          </p>
          <p className="mt-1 text-sm font-bold text-ink">
            {formatDate(product.updated_at)}
          </p>
        </div>
      </div>
    </div>
  );
}