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
import { ProductReviewsSection } from '@/components/public/ProductReviewsSection';
import { SectionContainer } from '@/components/public/SectionContainer';
import { WorkGallery } from '@/components/public/WorkGallery';
import { Badge } from '@/components/ui/Badge';
import { Button, Card, Eyebrow, NLink } from '@/components/ui/neobrutal';
import { MetaLabel, PageTitle, SectionBand, SectionIntro, SectionTitle } from '@/components/ui';
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
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'developDetail' });
  const product = await fetchProduct(slug);
  if (!product) {
    return {
      title: t('notFound'),
      robots: { index: false },
    };
  }

  const description = product.deskripsi
    ? product.deskripsi.slice(0, 160)
    : t('fallbackDescription', { name: product.nama });

  const previewImages = Array.isArray(product.preview_images)
    ? product.preview_images.filter((img): img is string => typeof img === 'string' && img.trim() !== '')
    : [];
  const ogImage = previewImages[0];

  return {
    ...buildMetadata({
      title: `${product.nama} — enpiistudio`,
      description,
    }),
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
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  const t = await getTranslations('developDetail');
  const tKatalog = await getTranslations('katalog');

  const kategori = product.category;
  const oneLineDesc = product.deskripsi?.split(/\r?\n/)[0]?.slice(0, 140) ?? '';
  const paragraphs = (product.deskripsi ?? '')
    .split(/\r?\n/)
    .filter((p) => p.trim() !== '');

  const previewImages = Array.isArray(product.preview_images)
    ? product.preview_images.filter((img): img is string => typeof img === 'string' && img.trim() !== '')
    : [];
  const pullQuoteIdx = paragraphs.length >= 2 ? 1 : -1;

  // Specs
  const specs: Array<{ label: string; value: string }> = [];
  specs.push({ label: t('type'), value: tKatalog(`tipe.${product.tipe}`) });
  if (kategori) specs.push({ label: t('category'), value: kategori.nama });
  if (product.needs_license_key) specs.push({ label: t('license'), value: t('included') });
  if (product.has_downloadable_file) {
    specs.push({
      label: t('download'),
      value: product.download_expiry_days
        ? t('days', { count: product.download_expiry_days })
        : t('unlimited'),
    });
  }
  if (product.is_featured) specs.push({ label: t('status'), value: t('studioPickLabel') });
  if (product.is_pre_order && product.release_date) {
    specs.push({ label: t('release'), value: t('releaseDateLong', { date: product.release_date }) });
  }

  return (
    <>
      {/* ───── 1. BREADCRUMB ───── */}
      <div className="relative z-0 bg-surface border-b-2 border-ink/20">
        <SectionContainer py="sm">
          <NLink
            href="/develop"
            variant="default"
            underline="none"
            className="font-label text-label-sm uppercase font-bold text-ink/70 hover:text-primary"
          >
            {t('back')}
          </NLink>
          {product.rating_summary && product.rating_summary.count > 0 && (
                <NLink
                  href="#reviews"
                  underline="none"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border-2 border-ink text-ink font-mono font-bold text-xs shadow-brutal-2 hover:bg-accent transition-colors"
                >
                  <span className="text-accent">?</span>
                  <span>{product.rating_summary.average.toFixed(1)}</span>
                  <span className="text-ink/60">({product.rating_summary.count})</span>
                </NLink>
              )}
              {kategori && (
            <span className="ml-4 font-label text-label-sm uppercase text-ink/40">
              · {kategori.nama}
            </span>
          )}
        </SectionContainer>
      </div>

      {/* ───── 2. HERO ───── */}
      <SectionBand>
        <SectionContainer py="xl" className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-16 items-center">
          {/* Image — large, thick border, hard shadow, slightly rotated */}
          <div className="relative">
            <Card variant="surface" thick elevation={10} hoverable={false} className="overflow-hidden -rotate-1 hover:rotate-0 transition-transform">
              {previewImages[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <Image
                  src={previewImages[0]}
                  alt={product.nama}
                  className="w-full aspect-43"
                />
              ) : (
                <div className="w-full aspect-43 bg-primary text-surface flex items-center justify-center font-display font-black uppercase text-3xl md:text-5xl text-center px-6 tracking-tighter">
                  {product.nama}
                </div>
              )}
            </Card>
            {/* Decorative accent block — bottom-right */}
            <CornerAccent className="absolute -bottom-6 -right-6 -z-0" />
          </div>

          {/* Info panel — title + chips + price + CTA */}
          <div className="flex flex-col gap-6">
            {/* Chips row */}
            <div className="flex flex-wrap gap-2">
              {product.is_featured && (
                <Badge tone="accent" size="md" elevation={2}>
                  {t('studioPick')}
                </Badge>
              )}
              {product.is_pre_order && (
                <Badge tone="primary" size="md" elevation={2}>
                  {t('preorderBadge')}
                </Badge>
              )}
              <Badge tone="ink" size="md" shadow={false}>
                {tKatalog(`tipe.${product.tipe}` as 'tipe.download' | 'tipe.license' | 'tipe.bundle' | never)}
              </Badge>
              {product.rating_summary && product.rating_summary.count > 0 && (
                <NLink
                  href="#reviews"
                  underline="none"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border-2 border-ink text-ink font-mono font-bold text-xs shadow-brutal-2 hover:bg-accent transition-colors"
                >
                  <span className="text-accent">?</span>
                  <span>{product.rating_summary.average.toFixed(1)}</span>
                  <span className="text-ink/60">({product.rating_summary.count})</span>
                </NLink>
              )}
              {kategori && (
                <Badge tone="surface" size="md" shadow={false}>
                  {kategori.nama}
                </Badge>
              )}
            </div>

            {/* Title */}
            <PageTitle size="hero-xl">
              {product.nama}
            </PageTitle>

            {/* One-liner description */}
            {oneLineDesc && (
              <p className="font-body text-body-lg text-ink/80 border-l-4 border-accent pl-4 italic">
                {oneLineDesc}
              </p>
            )}

            {/* Price — small gold tag. Untuk pre-order tampilkan DP + sisa. */}
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-3">
                <Badge tone="accent" size="lg">
                  {product.is_free
                    ? t('free')
                    : product.is_pre_order && product.deposit_amount
                      ? t('dpLabel', { percent: product.deposit_percent ?? 50 })
                      : formatRupiah(product.harga)}
                </Badge>
                {product.needs_license_key && (
                  <MetaLabel as="span" size="sm">
                    {t('licenseIncluded')}
                  </MetaLabel>
                )}
              </div>
              {product.is_pre_order && product.deposit_amount && (
                <p className="font-label text-label-sm uppercase text-ink/70">
                  {t('dpLabel', { percent: product.deposit_percent ?? 50 })}: <span className="font-bold">{formatRupiah(product.deposit_amount)}</span>
                  {' · '}
                  {t('remainingLabel')}: <span className="font-bold">{formatRupiah(product.remaining_amount ?? 0)}</span>
                </p>
              )}
            </div>

            {/* CTA — understated bordered button */}
            <div className="pt-2">
              <AddToCartControls
                productId={product.id}
                isPreOrder={product.is_pre_order}
                isFree={product.is_free}
                depositPercent={product.deposit_percent}
              />
            </div>
          </div>
        </SectionContainer>
      </SectionBand>

      {/* ───── 3. ABOUT (asymmetric 2-col) ───── */}
      {paragraphs.length > 0 && (
        <SectionBand>
          <SectionContainer py="xl" className="grid grid-cols-1 lg:grid-cols-[5fr_4fr] gap-10 lg:gap-16 items-start">
            {/* Pull-quote column — dominant */}
            <div>
              <Eyebrow size="md" color="accent" className="mb-6">
                {t('about')}
              </Eyebrow>
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
              <Eyebrow size="md" color="accent" className="mb-2">
                {t('quickFacts')}
              </Eyebrow>
              <dl className="space-y-3">
                <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink/10 pb-3">
                  <MetaLabel as="dt" size="sm">{t('type')}</MetaLabel>
                  <dd className="font-bold text-ink">{tKatalog(`tipe.${product.tipe}` as 'tipe.download' | 'tipe.license' | 'tipe.bundle' | never)}</dd>
                </div>
                {product.rating_summary && product.rating_summary.count > 0 && (
                <NLink
                  href="#reviews"
                  underline="none"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border-2 border-ink text-ink font-mono font-bold text-xs shadow-brutal-2 hover:bg-accent transition-colors"
                >
                  <span className="text-accent">?</span>
                  <span>{product.rating_summary.average.toFixed(1)}</span>
                  <span className="text-ink/60">({product.rating_summary.count})</span>
                </NLink>
              )}
              {kategori && (
                  <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink/10 pb-3">
                    <MetaLabel as="dt" size="sm">{t('category')}</MetaLabel>
                    <dd>
                      <NLink
                        href={`/develop?category=${kategori.slug}`}
                        variant="primary"
                        underline="static"
                      >
                        {kategori.nama}
                      </NLink>
                    </dd>
                  </div>
                )}
                {product.fitur && product.fitur.length > 0 && (
                  <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink/10 pb-3">
                    <MetaLabel as="dt" size="sm">{t('features')}</MetaLabel>
                    <dd className="font-bold text-ink">{t('items', { count: product.fitur.length })}</dd>
                  </div>
                )}
                {previewImages.length > 0 && (
                  <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink/10 pb-3">
                    <MetaLabel as="dt" size="sm">{t('preview')}</MetaLabel>
                    <dd className="font-bold text-ink">{t('images', { count: previewImages.length })}</dd>
                  </div>
                )}
                {product.has_downloadable_file && product.download_expiry_days && (
                  <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink/10 pb-3">
                    <MetaLabel as="dt" size="sm">{t('access')}</MetaLabel>
                    <dd className="font-bold text-ink">{t('days', { count: product.download_expiry_days })}</dd>
                  </div>
                )}
                {product.needs_license_key && (
                  <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink/10 pb-3">
                    <MetaLabel as="dt" size="sm">{t('license')}</MetaLabel>
                    <dd className="font-bold text-ink">{t('included')}</dd>
                  </div>
                )}
              </dl>

              <div className="pt-4">
                <Link
                  href="/display"
                  className="inline-flex items-center gap-2 font-label text-label-sm uppercase font-bold text-primary hover:text-ink transition-colors"
                >
                  {t('readProcess')}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </SectionContainer>
        </SectionBand>
      )}

      {/* ───── 4. DETAILS (bordered checklist grid) ───── */}
      {specs.length > 0 && (
        <SectionBand>
          <SectionContainer py="lg">
            <SectionIntro eyebrow={t('details')}>
              <SectionTitle className="mb-10">{t('specsTitle')}</SectionTitle>
            </SectionIntro>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {specs.map((spec) => (
                <Card
                  key={spec.label}
                  variant="surface"
                  hoverable={false}
                  className="p-4"
                >
                  <Eyebrow size="label-sm" color="ink-muted" className="mb-2">
                    → {spec.label}
                  </Eyebrow>
                  <p className="font-display text-xl font-black uppercase text-ink leading-tight">
                    {spec.value}
                  </p>
                </Card>
              ))}
            </div>

            {/* Fitur checklist (kalau ada) */}
            {product.fitur && product.fitur.length > 0 && (
              <div className="mt-10">
                <Eyebrow size="md" color="ink-muted" className="mb-4">
                  {t('includedTitle')}
                </Eyebrow>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.fitur.map((f, i) => (
                    <li key={i}>
                      <Card variant="surface" hoverable={false} elevation={3} className="flex items-start gap-3 px-4 py-3">
                        <span
                          aria-hidden="true"
                          className="inline-flex shrink-0 items-center justify-center w-6 h-6 bg-accent border-2 border-ink text-ink font-bold text-xs"
                        >
                          ✓
                        </span>
                        <span className="font-body text-body-sm text-ink leading-snug">
                          {f}
                        </span>
                      </Card>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </SectionContainer>
        </SectionBand>
      )}

      {/* ───── 5. GALLERY (irregular grid) ───── */}
      {previewImages.length > 1 && (
        <SectionBand>
          <SectionContainer py="lg">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <SectionIntro eyebrow={t('gallery')}>
                <SectionTitle>{t('galleryTitle')}</SectionTitle>
              </SectionIntro>
              <p className="font-body text-body-md text-ink/60">
                {t('galleryHint')}
              </p>
            </div>

            <WorkGallery
              images={previewImages}
              alt={product.nama}
              title={product.nama}
            />
          </SectionContainer>
        </SectionBand>
      )}

      {/* ───── 6. LINKED POSTS (panduan, warning, catatan admin) ───── */}
      {product.linked_posts && product.linked_posts.length > 0 && (
        <SectionBand>
          <SectionContainer py="lg">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <SectionIntro eyebrow={t('linkedPostsEyebrow')}>
                <SectionTitle>{t('linkedPostsTitle')}</SectionTitle>
              </SectionIntro>
              <p className="font-body text-body-md text-ink/60 max-w-md">
                {t('linkedPostsHint')}
              </p>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.linked_posts.map((p) => (
                <li key={p.id}>
                  <NLink
                    href={`/display/${p.slug}`}
                    variant="default"
                    underline="hover"
                    className="block border-4 border-ink bg-surface p-5 neo-btn neo-btn-ink h-full"
                  >
                    <Eyebrow size="sm" color="accent" className="mb-2">
                      → {t('linkedPostsRead')}
                    </Eyebrow>
                    <h3 className="font-display text-xl font-black uppercase tracking-tight text-ink leading-tight mb-2">
                      {p.title}
                    </h3>
                    {p.excerpt && (
                      <p className="font-body text-body-sm text-ink/70 line-clamp-3">
                        {p.excerpt}
                      </p>
                    )}
                  </NLink>
                </li>
              ))}
            </ul>
          </SectionContainer>
        </SectionBand>
      )}

      {/* ───── 7. RELATED WORKS ───── */}
      <RelatedWorks currentSlug={product.slug} categorySlug={kategori?.slug} />

      {/* Final CTA — re-invoke primary action */}
      <section className="bg-primary text-surface">
        <SectionContainer py="lg" className="text-center">
          <Eyebrow size="md" color="accent" className="mb-4">
            {t('finalEyebrow', { name: product.nama })}
          </Eyebrow>
          <h2 className="font-display text-3xl md:text-5xl font-black uppercase leading-tight mb-8 max-w-3xl mx-auto">
            {t('finalTitle')}
          </h2>
          <div className="flex justify-center">
            <Button
              variant="surface"
              size="lg"
              href="/develop"
              shadowColor="accent"
              className="inline-flex items-center gap-2"
            >
              {t('backFinal')}
            </Button>
          </div>
        </SectionContainer>
      </section>
    </>
  );
}
import { buildMetadata } from '@/lib/seo';
import { CornerAccent } from '@/components/ui/CornerAccent';
import { Image } from '@/components/ui/Image';
