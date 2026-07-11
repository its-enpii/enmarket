/**
 * Work Detail — portfolio case study page (enpiistudio).
 *
 * Brief: halaman ini BUKAN e-commerce product page. Rasanya seperti flipping
 * through a designer's case study book.
 *
 * 6 sections (sesuai brief user):
 *   1. Breadcrumb — minimal "← Back to Develop"
 *   2. Hero — image (rotated -1deg, thick border, hard shadow) left,
 *      title (oversized) + 1-line desc + gold price tag + understated
 *      "Add to Cart" CTA right
 *   3. About — asymmetric 2-col block, 2-3 paragraph case study
 *      dengan pull-quote gold highlight
 *   4. Details — bordered checklist grid (fitur/specs/license)
 *   5. Gallery — irregular image grid (3 sizes, thick border + shadow)
 *   6. Related works — 3 smaller bordered cards dari same category
 *
 * Tone: editorial / curated, bukan product listing template.
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { RelatedWorks } from '@/components/public/RelatedWorks';
import { WorkGallery } from '@/components/public/WorkGallery';
import { AddToCartControls } from './AddToCartControls';
import { Link } from '@/i18n/navigation';

import { formatRupiah, TIPE_LABEL } from '@/lib/format';
import { publicApi, PublicFetchError } from '@/lib/public-api';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
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
      title: 'Work tidak ditemukan — enpiistudio',
      robots: { index: false },
    };
  }

  const description = product.deskripsi
    ? product.deskripsi.slice(0, 160)
    : `${product.nama} — karya dari studio enpii.`;

  const ogImage = product.preview_images?.[0];

  return {
    title: `${product.nama} — enpiistudio`,
    description,
    keywords: [product.nama, product.category?.nama ?? '', TIPE_LABEL[product.tipe] ?? product.tipe].filter(Boolean),
    alternates: { canonical: `/develop/${product.slug}` },
    openGraph: {
      title: product.nama,
      description,
      type: 'website',
      url: `/develop/${product.slug}`,
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

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  const t = await getTranslations('developDetail');
  const tCommon = await getTranslations('common.buttons');
  const tKatalog = await getTranslations('katalog');
  const isEn = locale === 'en';
  const L = (id: string, en: string) => (isEn ? en : id);

  const kategori = product.category;
  const oneLineDesc = product.deskripsi?.split(/\r?\n/)[0]?.slice(0, 140) ?? '';
  const paragraphs = (product.deskripsi ?? '')
    .split(/\r?\n/)
    .filter((p) => p.trim() !== '');

  const pullQuoteIdx = paragraphs.length >= 2 ? 1 : -1;

  // Specs
  const specs: Array<{ label: string; value: string }> = [];
  specs.push({ label: L('Tipe', 'Type'), value: tKatalog(`tipe.${product.tipe}`) });
  if (kategori) specs.push({ label: L('Kategori', 'Category'), value: kategori.nama });
  if (product.needs_license_key) specs.push({ label: L('Lisensi', 'License'), value: L('Termasuk key', 'Key included') });
  if (product.has_downloadable_file) {
    specs.push({
      label: L('Download', 'Download'),
      value: product.download_expiry_days ? `${product.download_expiry_days} ${L('hari', 'days')}` : L('Selamanya', 'Unlimited'),
    });
  }
  if (product.is_featured) specs.push({ label: L('Status', 'Status'), value: L('Studio pick', 'Studio pick') });

  return (
    <>
      {/* ───── 1. BREADCRUMB ───── */}
      <div className="relative z-0 bg-surface border-b-2 border-ink/20">
        <div className="px-6 md:px-12 py-4">
          <Link
            href="/develop"
            className="inline-flex items-center gap-2 font-label text-label-sm uppercase font-bold text-ink/70 hover:text-primary transition-colors"
          >
            <span aria-hidden="true">←</span> {L('Kembali ke Develop', 'Back to Develop')}
          </Link>
          {kategori && (
            <span className="ml-4 font-label text-label-sm uppercase text-ink/40">
              · {kategori.nama}
            </span>
          )}
        </div>
      </div>

      {/* ───── 2. HERO ───── */}
      <section className="border-b-4 border-ink">
        <div className="px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-16 items-center">
          {/* Image — large, thick border, hard shadow, slightly rotated */}
          <div className="relative">
            <div className="bg-surface border-4 border-ink shadow-[10px_10px_0_0_var(--color-ink)] overflow-hidden -rotate-1 hover:rotate-0 transition-transform">
              {product.preview_images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.preview_images[0]}
                  alt={product.nama}
                  className="w-full aspect-[4/3] object-cover"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-primary text-surface flex items-center justify-center font-display font-black uppercase text-3xl md:text-5xl text-center px-6 tracking-tighter">
                  {product.nama}
                </div>
              )}
            </div>
            {/* Decorative accent block — bottom-right */}
            <div className="hidden md:block absolute -bottom-6 -right-6 w-24 h-24 bg-accent border-4 border-ink shadow-[6px_6px_0_0_var(--color-ink)] rotate-12 -z-0" />
          </div>

          {/* Info panel — title + chips + price + CTA */}
          <div className="flex flex-col gap-6">
            {/* Chips row */}
            <div className="flex flex-wrap gap-2">
              {product.is_featured && (
                <span className="inline-flex items-center bg-accent text-ink border-2 border-ink px-3 py-1 font-label text-label-sm font-black uppercase tracking-wider shadow-[2px_2px_0_0_var(--color-ink)]">
                  ✎ Studio Pick
                </span>
              )}
              <span className="inline-flex items-center bg-ink text-surface border-2 border-ink px-3 py-1 font-label text-label-sm font-black uppercase tracking-wider">
                {tKatalog(`tipe.${product.tipe}` as 'tipe.download' | 'tipe.license' | 'tipe.bundle' | never)}
              </span>
              {kategori && (
                <span className="inline-flex items-center bg-surface text-ink border-2 border-ink px-3 py-1 font-label text-label-sm font-bold uppercase tracking-wider">
                  {kategori.nama}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
              {product.nama}
            </h1>

            {/* One-liner description */}
            {oneLineDesc && (
              <p className="font-body text-body-lg text-ink/80 border-l-4 border-accent pl-4 italic">
                {oneLineDesc}
              </p>
            )}

            {/* Price — small gold tag, NOT a big banner */}
            <div className="flex items-baseline gap-3">
              <span className="inline-flex items-center bg-accent text-ink border-2 border-ink px-4 py-2 font-display text-2xl md:text-3xl font-black uppercase shadow-[4px_4px_0_0_var(--color-ink)]">
                {formatRupiah(product.harga)}
              </span>
              {product.needs_license_key && (
                <span className="font-label text-label-sm uppercase tracking-wider text-ink/60">
                  + license key
                </span>
              )}
            </div>

            {/* CTA — understated bordered button */}
            <div className="pt-2">
              <AddToCartControls productId={product.id} />
            </div>
          </div>
        </div>
      </section>

      {/* ───── 3. ABOUT (asymmetric 2-col) ───── */}
      {paragraphs.length > 0 && (
        <section className="border-b-4 border-ink">
          <div className="px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-[5fr_4fr] gap-10 lg:gap-16 items-start">
            {/* Pull-quote column — dominant */}
            <div>
              <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-6">
                ✎ About this work
              </p>
              <blockquote className="font-display text-3xl md:text-5xl font-black uppercase leading-[1.05] tracking-tight text-ink">
                {paragraphs.map((p, i) =>
                  i === pullQuoteIdx ? (
                    <span
                      key={i}
                      className="inline bg-accent text-ink px-2 py-1 border-2 border-ink shadow-[4px_4px_0_0_var(--color-primary)] my-2"
                    >
                      {p}
                    </span>
                  ) : (
                    <span key={i} className="block mb-4 last:mb-0 text-ink/85 not-italic font-body text-body-lg normal-case">
                      {p}
                    </span>
                  ),
                )}
              </blockquote>
            </div>

            {/* Sidebar — quick facts panel (data-driven, no boilerplate) */}
            <div className="space-y-4 font-body text-body-md text-ink/80 lg:pt-12">
              <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-2">
                ✎ Quick facts
              </p>
              <dl className="space-y-3">
                <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink/10 pb-3">
                  <dt className="font-label text-label-sm uppercase text-ink/60">{L('Tipe', 'Type')}</dt>
                  <dd className="font-bold text-ink">{tKatalog(`tipe.${product.tipe}` as 'tipe.download' | 'tipe.license' | 'tipe.bundle' | never)}</dd>
                </div>
                {kategori && (
                  <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink/10 pb-3">
                    <dt className="font-label text-label-sm uppercase text-ink/60">Category</dt>
                    <dd>
                      <Link
                        href={`/develop?category=${kategori.slug}`}
                        className="font-bold text-primary hover:text-accent underline decoration-2 underline-offset-4"
                      >
                        {kategori.nama}
                      </Link>
                    </dd>
                  </div>
                )}
                {product.fitur && product.fitur.length > 0 && (
                  <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink/10 pb-3">
                    <dt className="font-label text-label-sm uppercase text-ink/60">Fitur</dt>
                    <dd className="font-bold text-ink">{product.fitur.length} item</dd>
                  </div>
                )}
                {product.preview_images && product.preview_images.length > 0 && (
                  <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink/10 pb-3">
                    <dt className="font-label text-label-sm uppercase text-ink/60">Preview</dt>
                    <dd className="font-bold text-ink">{product.preview_images.length} gambar</dd>
                  </div>
                )}
                {product.has_downloadable_file && product.download_expiry_days && (
                  <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink/10 pb-3">
                    <dt className="font-label text-label-sm uppercase text-ink/60">Akses</dt>
                    <dd className="font-bold text-ink">{product.download_expiry_days} hari</dd>
                  </div>
                )}
                {product.needs_license_key && (
                  <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink/10 pb-3">
                    <dt className="font-label text-label-sm uppercase text-ink/60">License</dt>
                    <dd className="font-bold text-ink">Termasuk</dd>
                  </div>
                )}
              </dl>

              <div className="pt-4">
                <Link
                  href="/display"
                  className="inline-flex items-center gap-2 font-label text-label-sm uppercase font-bold text-primary hover:text-ink transition-colors"
                >
                  Baca proses di Display
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ───── 4. DETAILS (bordered checklist grid) ───── */}
      {specs.length > 0 && (
        <section className="border-b-4 border-ink bg-surface">
          <div className="px-6 md:px-12 py-16 md:py-20">
            <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-3">
              ✎ Details
            </p>
            <h2 className="font-display text-headline-lg-mobile md:text-headline-lg font-extrabold uppercase tracking-tight text-ink mb-10">
              Specs &{' '}
              <span className="text-primary">fitur</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="bg-surface border-2 border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)]"
                >
                  <p className="font-label text-label-sm uppercase tracking-[0.2em] text-ink/60 mb-2">
                    → {spec.label}
                  </p>
                  <p className="font-display text-xl font-black uppercase text-ink leading-tight">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Fitur checklist (kalau ada) */}
            {product.fitur && product.fitur.length > 0 && (
              <div className="mt-10">
                <p className="font-label text-label-sm uppercase tracking-[0.3em] text-ink/60 mb-4">
                  ✎ Yang kamu dapat
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.fitur.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 bg-surface border-2 border-ink px-4 py-3 shadow-[3px_3px_0_0_var(--color-ink)]"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-flex shrink-0 items-center justify-center w-6 h-6 bg-accent border-2 border-ink text-ink font-bold text-xs"
                      >
                        ✓
                      </span>
                      <span className="font-body text-body-sm text-ink leading-snug">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ───── 5. GALLERY (irregular grid) ───── */}
      {product.preview_images && product.preview_images.length > 1 && (
        <section className="border-b-4 border-ink">
          <div className="px-6 md:px-12 py-16 md:py-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-3">
                  ✎ Gallery
                </p>
                <h2 className="font-display text-headline-lg-mobile md:text-headline-lg font-extrabold uppercase tracking-tight text-ink">
                  Lebih dekat.
                </h2>
              </div>
              <p className="font-body text-body-md text-ink/60">
                Klik thumbnail untuk lihat lebih besar.
              </p>
            </div>

            <WorkGallery
              images={product.preview_images}
              alt={product.nama}
              title={product.nama}
            />
          </div>
        </section>
      )}

      {/* ───── 6. RELATED WORKS ───── */}
      <RelatedWorks currentSlug={product.slug} categorySlug={kategori?.slug} />

      {/* Final CTA — re-invoke primary action */}
      <section className="bg-primary text-surface">
        <div className="px-6 md:px-12 py-16 md:py-20 text-center">
          <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-4">
            ✎ Tertarik dengan {product.nama}?
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-black uppercase leading-tight mb-8 max-w-3xl mx-auto">
            Tambah ke keranjang, atau lihat{' '}
            <Link
              href="/develop"
              className="inline-block bg-accent text-ink px-2 py-0.5 -rotate-1 hover:rotate-0 transition-transform"
            >
              karya lain
            </Link>
            .
          </h2>
          <div className="flex justify-center">
            <Link
              href="/develop"
              className="inline-flex items-center gap-2 bg-surface text-ink border-4 border-ink px-8 py-4 font-label text-label-sm uppercase font-black tracking-wider shadow-[6px_6px_0_0_var(--color-accent)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--color-accent)] transition-all"
            >
              ← Kembali ke Develop
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}