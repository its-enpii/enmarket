'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import { Button, Card, NLink } from '@/components/ui/neobrutal';
import { Badge } from '@/components/ui/Badge';
import { formatRupiah, TIPE_LABEL } from '@/lib/format';
import type { Product } from '@/lib/types';
import { Image } from '@/components/ui/Image';
import { ImagePlaceholder } from '@/components/ui';

interface Props {
  trending: Product[]; // biasanya featured
  latest: Product[];
}

/**
 * Section "Trending" + "Latest" — layout asimetris biar tidak boring.
 *   - Mobile: stack vertikal, kartu full-width.
 *   - ≥md: 1 kartu besar (kolom pertama trending) + 2 vertikal di kanan.
 *   - Latest: strip horizontal scrollable (chip-card kecil) di bawah.
 *
 * Tone: marketplace, bukan studio lagi.
 */
export function TrendingSection({ trending, latest }: Props) {
  const t = useTranslations('trending');
  // Pakai fallback placeholder kalau data kosong — biar section tetap
  // punya visual marketplace yang kaya, tidak hilang begitu saja.
  const trendingData = trending.length > 0 ? trending : PLACEHOLDER_TRENDING;
  const latestData = latest.length > 0 ? latest : PLACEHOLDER_LATEST;
  const trendingIsPlaceholder = trending.length === 0;
  const latestIsPlaceholder = latest.length === 0;

  const [hero, ...rest] = trendingData;
  const sideCards = rest.slice(0, 2);

  return (
    <section id="trending" aria-label={t('ariaLabel')} className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-micro sm:text-xs font-bold uppercase tracking-label text-accent">
              {t('eyebrow')}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink leading-tight">
              {trendingIsPlaceholder ? t('headingPlaceholder') : t('headingReal')}
            </h2>
            {trendingIsPlaceholder && (
              <p className="text-xs text-ink/60 mt-1">
                {t('placeholderHint')}
              </p>
            )}
          </div>
          <NLink
            href="/katalog"
            variant="primary"
            underline="static"
            arrow
            className="shrink-0 text-xs sm:text-sm"
          >
            {t('viewAll')}
          </NLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {hero && <TrendingHeroCard product={hero} isPlaceholder={trendingIsPlaceholder} />}
          <div className="flex flex-col gap-5">
            {sideCards.map((p) => (
              <TrendingSideCard key={p.id} product={p} isPlaceholder={trendingIsPlaceholder} />
            ))}
            {sideCards.length === 1 && (
              // Isi slot terakhir dengan CTA bundle
              <Card variant="filled-accent" hoverable={false} className="p-4 flex flex-col justify-between">
                <div>
                  <p className="text-micro font-bold uppercase tracking-wider">📦 Paket Hemat</p>
                  <p className="mt-1 font-bold text-lg leading-snug">
                    {t('bundleBody')}
                  </p>
                </div>
                <Button
                  href="/katalog?tipe=bundle"
                  variant="ink"
                  size="sm"
                  className="mt-3 self-start"
                >
                  {t('bundleCta')}
                </Button>
              </Card>
            )}
            {sideCards.length === 0 && (
              <div className="flex-1 bg-surface border-2 border-dashed border-ink p-4 text-center text-ink/60 flex flex-col justify-center min-h-[120px]">
                <p className="font-bold text-sm">{t('emptyTitle')}</p>
                <p className="text-xs mt-1">{t('emptyHint')}</p>
                <NLink
                  href="/login"
                  variant="primary"
                  underline="static"
                  className="mt-2 self-center text-xs"
                >
                  {t('emptyLogin')}
                </NLink>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-micro sm:text-xs font-bold uppercase tracking-label text-primary">
              {t('latestEyebrow')}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-ink leading-tight">
              {t('latestHeading')}
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-none -mx-6 px-6">
          <ul className="flex gap-4 min-w-min pb-2">
            {latestData.map((p) => (
              <li key={p.id} className="shrink-0 w-56 sm:w-64">
                <Link
                  href={latestIsPlaceholder ? '/katalog' : `/develop/${p.slug}`}
                  className="group block bg-surface border-2 border-ink shadow-brutal-3 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-1 transition-all"
                >
                  <div className="aspect-43 bg-primary/10 border-b-2 border-ink overflow-hidden relative">
                    {p.preview_images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <Image
                        src={p.preview_images[0]}
                        alt={p.nama}
                        className="w-full h-full"
                      />
                    ) : (
                      <ImagePlaceholder>
                        <span className="font-bold text-xs uppercase tracking-wider opacity-80">
                          {p.nama.split(' ').slice(0, 2).join(' ')}
                        </span>
                      </ImagePlaceholder>
                    )}
                    <Badge tone="ink" size="sm" className="absolute top-2 right-2 font-bold">
                      {TIPE_LABEL[p.tipe] ?? p.tipe}
                    </Badge>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm leading-tight line-clamp-2 text-ink">
                      {p.nama}
                    </h3>
                    <p className="mt-2 font-bold text-primary text-base">
                      {formatRupiah(p.harga)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * Placeholder cards — tampil saat API kosong / tidak ada produk.
 * Pakai data statis ini agar section tidak hilang & user paham
 * bahwa area ini akan terisi setelah admin menambah produk.
 */
const PLACEHOLDER_TRENDING: Product[] = [
  {
    id: -1,
    category_id: null,
    category: { id: 0, nama: 'Karya Pilihan', slug: 'karya-pilihan' },
    nama: 'Karya Unggulan #1',
    slug: '#',
    deskripsi:
      'Contoh etalase — isi nyata akan tampil setelah admin menambah karya dari dashboard.',
    harga: '149000',
    harga_formatted: 'Rp 149.000',
    tipe: 'download',
    file_url: null,
    download_expiry_days: null,
    preview_images: [],
    fitur: [],
    status: 'aktif',
    is_featured: true,
    is_pre_order: false,
    is_free: false,
    needs_license_key: false,
    has_downloadable_file: true,
    created_at: null,
    updated_at: null,
  },
  {
    id: -2,
    category_id: null,
    category: { id: 0, nama: 'Karya Pilihan', slug: 'karya-pilihan' },
    nama: 'Karya Unggulan #2',
    slug: '#',
    deskripsi: 'Contoh etalase kedua.',
    harga: '299000',
    harga_formatted: 'Rp 299.000',
    tipe: 'license',
    file_url: null,
    download_expiry_days: null,
    preview_images: [],
    fitur: [],
    status: 'aktif',
    is_featured: false,
    is_pre_order: false,
    is_free: false,
    needs_license_key: true,
    has_downloadable_file: false,
    created_at: null,
    updated_at: null,
  },
  {
    id: -3,
    category_id: null,
    category: { id: 0, nama: 'Karya Pilihan', slug: 'karya-pilihan' },
    nama: 'Karya Unggulan #3',
    slug: '#',
    deskripsi: 'Contoh etalase ketiga.',
    harga: '399000',
    harga_formatted: 'Rp 399.000',
    tipe: 'bundle',
    file_url: null,
    download_expiry_days: null,
    preview_images: [],
    fitur: [],
    status: 'aktif',
    is_featured: false,
    is_pre_order: false,
    is_free: false,
    needs_license_key: false,
    has_downloadable_file: true,
    created_at: null,
    updated_at: null,
  },
];

const PLACEHOLDER_LATEST: Product[] = [
  {
    id: -10,
    category_id: null,
    category: { id: 0, nama: 'Karya Terbaru', slug: 'karya-terbaru' },
    nama: 'Karya Baru #1',
    slug: '#',
    deskripsi: '',
    harga: '99000',
    harga_formatted: 'Rp 99.000',
    tipe: 'download',
    file_url: null,
    download_expiry_days: null,
    preview_images: [],
    fitur: [],
    status: 'aktif',
    is_featured: false,
    is_pre_order: false,
    is_free: false,
    needs_license_key: false,
    has_downloadable_file: true,
    created_at: null,
    updated_at: null,
  },
  {
    id: -11,
    category_id: null,
    category: { id: 0, nama: 'Karya Terbaru', slug: 'karya-terbaru' },
    nama: 'Karya Baru #2',
    slug: '#',
    deskripsi: '',
    harga: '199000',
    harga_formatted: 'Rp 199.000',
    tipe: 'license',
    file_url: null,
    download_expiry_days: null,
    preview_images: [],
    fitur: [],
    status: 'aktif',
    is_featured: false,
    is_pre_order: false,
    is_free: false,
    needs_license_key: true,
    has_downloadable_file: false,
    created_at: null,
    updated_at: null,
  },
  {
    id: -12,
    category_id: null,
    category: { id: 0, nama: 'Karya Terbaru', slug: 'karya-terbaru' },
    nama: 'Karya Baru #3',
    slug: '#',
    deskripsi: '',
    harga: '249000',
    harga_formatted: 'Rp 249.000',
    tipe: 'bundle',
    file_url: null,
    download_expiry_days: null,
    preview_images: [],
    fitur: [],
    status: 'aktif',
    is_featured: false,
    is_pre_order: false,
    is_free: false,
    needs_license_key: false,
    has_downloadable_file: true,
    created_at: null,
    updated_at: null,
  },
  {
    id: -13,
    category_id: null,
    category: { id: 0, nama: 'Karya Terbaru', slug: 'karya-terbaru' },
    nama: 'Karya Baru #4',
    slug: '#',
    deskripsi: '',
    harga: '129000',
    harga_formatted: 'Rp 129.000',
    tipe: 'download',
    file_url: null,
    download_expiry_days: null,
    preview_images: [],
    fitur: [],
    status: 'aktif',
    is_featured: false,
    is_pre_order: false,
    is_free: false,
    needs_license_key: false,
    has_downloadable_file: true,
    created_at: null,
    updated_at: null,
  },
  {
    id: -14,
    category_id: null,
    category: { id: 0, nama: 'Karya Terbaru', slug: 'karya-terbaru' },
    nama: 'Karya Baru #5',
    slug: '#',
    deskripsi: '',
    harga: '349000',
    harga_formatted: 'Rp 349.000',
    tipe: 'license',
    file_url: null,
    download_expiry_days: null,
    preview_images: [],
    fitur: [],
    status: 'aktif',
    is_featured: false,
    is_pre_order: false,
    is_free: false,
    needs_license_key: true,
    has_downloadable_file: false,
    created_at: null,
    updated_at: null,
  },
];

/** Hero card — besar, 1 kolom penuh di mobile, sisi kiri di md+. */
function TrendingHeroCard({ product, isPlaceholder }: { product: Product; isPlaceholder?: boolean }) {
  const t = useTranslations('trending');
  const thumb = product.preview_images?.[0];
  return (
    <Link
      href={isPlaceholder ? '/katalog' : `/develop/${product.slug}`}
      className="group relative bg-primary text-surface border-2 border-ink shadow-brutal-6 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-8 active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-3 transition-all flex flex-col"
    >
      <div className="aspect-[16/10] bg-surface border-b-2 border-ink overflow-hidden relative">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <Image
            src={thumb}
            alt={product.nama}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/30 text-surface font-bold uppercase tracking-wider">
            {t('noImage')}
          </div>
        )}
        {product.is_featured && (
          <Badge tone="accent" size="sm" className="absolute top-3 left-3 px-2.5 py-1 font-bold">
            {t('featured')}
          </Badge>
        )}
        <Badge tone="ink" size="sm" className="absolute top-3 right-3 px-2.5 py-1 font-bold">
          {TIPE_LABEL[product.tipe] ?? product.tipe}
        </Badge>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <p className="text-micro font-bold uppercase tracking-wider text-accent">
          {product.category?.nama ?? t('noCategory')}
        </p>
        <h3 className="mt-2 text-2xl sm:text-3xl font-bold leading-tight text-surface line-clamp-2">
          {product.nama}
        </h3>
        <p className="mt-3 text-sm text-surface/80 line-clamp-2 flex-1">
          {product.deskripsi}
        </p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-micro font-bold uppercase tracking-wider text-surface/70">{t('priceLabel')}</p>
            <p className="font-mono text-2xl sm:text-3xl font-bold leading-none text-accent">
              {formatRupiah(product.harga)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 bg-accent text-ink border-2 border-ink px-3 py-2 text-xs font-bold shadow-brutal-3 group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-brutal-4 transition-all">
            {t('viewCta')}
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Side card — kompak, horizontal di mobile, vertikal di md+. */
function TrendingSideCard({ product, isPlaceholder }: { product: Product; isPlaceholder?: boolean }) {
  const t = useTranslations('trending');
  const thumb = product.preview_images?.[0];
  return (
    <Link
      href={isPlaceholder ? '/katalog' : `/develop/${product.slug}`}
      className="group block bg-surface border-2 border-ink shadow-brutal-4 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-6 active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-2 transition-all"
    >
      <div className="flex sm:flex-row flex-col">
        <div className="sm:w-32 sm:h-32 w-full h-40 bg-primary/10 border-b-2 sm:border-b-0 sm:border-r-2 border-ink overflow-hidden relative shrink-0">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <Image
              src={thumb}
              alt={product.nama}
              className="w-full h-full"
            />
          ) : (
            <ImagePlaceholder>
              <span className="font-bold text-micro uppercase tracking-wider opacity-80">
                {t('noImage')}
              </span>
            </ImagePlaceholder>
          )}
        </div>
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-micro font-bold uppercase tracking-wider text-ink/60">
              {product.category?.nama ?? t('noCategory')}
            </p>
            <h3 className="mt-1 font-bold text-sm sm:text-base leading-tight text-ink line-clamp-2 group-hover:text-primary transition-colors">
              {product.nama}
            </h3>
          </div>
          <p className="mt-2 font-bold text-primary text-base sm:text-lg">
            {formatRupiah(product.harga)}
          </p>
        </div>
      </div>
    </Link>
  );
}
