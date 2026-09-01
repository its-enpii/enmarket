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

import { buildMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

import { loadAllMedia } from '@/lib/media';
import { AdminPageHeader, AdminPageBody } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';

import { MediaGallery } from './MediaGallery';

interface Props {
  searchParams: Promise<{ pick?: string; q?: string; source?: string; type?: string }>;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.media' });
  return buildMetadata({
    title: `${t('listTitle')} — Admin`,
  });
}

export default async function MediaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const pickerMode = sp.pick === '1';
  const t = await getTranslations('admin.media');

  // Server-side fetch — boleh pakai apiGet (next/headers server-only).
  // Hasil dilempar sebagai prop ke client component (serializable).
  const items = await loadAllMedia();

  return (
    <AdminPageBody>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <AdminPageHeader
          className="border-b-0 pb-0"
          eyebrow={t('listEyebrow')}
          title={t('listTitle')}
          subtitle={t('listSubtitle')}
        />
          {pickerMode && (
            <Badge tone="accent" size="sm" className="gap-1 px-3 py-1.5 font-bold shadow-[2px_2px_0_0_var(--color-ink)] self-start">
              {t('pickerBadge')}
            </Badge>
          )}
      </div>

      <MediaGallery
        initialItems={items}
        initialFilters={{
          q: sp.q ?? '',
          source: (sp.source as 'all' | 'product' | 'post') ?? 'all',
          type: (sp.type as 'all' | 'image' | 'video' | 'other') ?? 'all',
        }}
        pickerMode={pickerMode}
      />
    </AdminPageBody>
  );
}
