/**
 * Media library — gallery of all uploaded files (scanned from existing entities).
 *
 * Catatan: backend belum punya media table dedicated. Kita scan dari
 * Product.preview_images + Post.thumbnail. Untuk backend-ready nanti,
 * ganti `loadAllMedia()` di `lib/media.ts` dengan endpoint `/api/admin/media`.
 *
 * Mood: studio gallery — chunky bordered cards, hard shadow, hover lift.
 * Filter bar: source (all/product/post) + type (all/image/video) + search.
 *
 * Picker mode: kalau URL `?pick=1`, click image → postMessage ke opener
 * (parent window) + close. Untuk integrasi dengan form produk.
 */

import { getTranslations } from 'next-intl/server';

import { loadAllMedia } from '@/lib/media';
import { Badge } from '@/components/ui/Badge';

import { MediaGallery } from './MediaGallery';

interface Props {
  searchParams: Promise<{ pick?: string; q?: string; source?: string; type?: string }>;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.media' });
  return { title: `${t('listTitle')} — Admin` };
}

export default async function MediaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const pickerMode = sp.pick === '1';
  const t = await getTranslations('admin.media');

  // Server-side fetch — boleh pakai apiGet (next/headers server-only).
  // Hasil dilempar sebagai prop ke client component (serializable).
  const items = await loadAllMedia();

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <header className="border-b-4 border-ink pb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-3">
              {t('listEyebrow')}
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tight text-ink">
              {t('listTitle')}<span className="text-primary">.</span>
            </h1>
            <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
              {t('listSubtitle')}
            </p>
          </div>
          {pickerMode && (
            <Badge tone="accent" size="sm" className="gap-1 px-3 py-1.5 font-bold shadow-[2px_2px_0_0_var(--color-ink)] self-start">
              {t('pickerBadge')}
            </Badge>
          )}
        </div>
      </header>

      <MediaGallery
        initialItems={items}
        initialFilters={{
          q: sp.q ?? '',
          source: (sp.source as 'all' | 'product' | 'post') ?? 'all',
          type: (sp.type as 'all' | 'image' | 'video' | 'other') ?? 'all',
        }}
        pickerMode={pickerMode}
      />
    </div>
  );
}