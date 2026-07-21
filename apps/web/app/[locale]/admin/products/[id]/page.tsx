import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { PreviewImagesManager } from '@/components/admin/PreviewImagesManager';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Card, NLink } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import { TIPE_LABEL, formatRupiah } from '@/lib/format';
import type {
  Category,
  LinkedPost,
  PaginatedResponse,
  Product,
  SingleResponse,
} from '@/lib/types';

import { ProductForm } from '../ProductForm';

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

async function loadProduct(id: string) {
  try {
    const res = await apiGet<SingleResponse<Product>>(`/api/admin/products/${id}`);
    return res.data;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) {
      notFound();
    }
    throw err;
  }
}

async function loadCategories() {
  try {
    const res = await apiGet<SingleResponse<Category[]>>('/api/admin/categories');
    return res.data ?? [];
  } catch {
    return [];
  }
}

async function loadAvailablePosts(): Promise<LinkedPost[]> {
  try {
    const res = await apiGet<PaginatedResponse<{
      id: number;
      slug: string;
      title: string;
      excerpt: string | null;
      thumbnail: string | null;
    }>>('/api/admin/posts', { status: 'published', per_page: 100 });
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  void id;
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.products' });
  return { title: `${t('listTitle')} — Admin` };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);

  const [product, categories, availablePosts, t] = await Promise.all([
    loadProduct(id),
    loadCategories(),
    loadAvailablePosts(),
    getTranslations('admin.products'),
  ]);

  if (!product) notFound();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
          {t('editEyebrow')}
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
          {product.nama}<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          {t('editSubtitle')}
        </p>
      </header>

      {/* Quick info */}
      <Card variant="surface" className="p-4 flex flex-wrap items-center gap-3">
        <StatusBadge status={product.status} />
        <span className="text-sm">
          <strong>{t('quickInfo.type')}:</strong> {TIPE_LABEL[product.tipe] ?? product.tipe}
        </span>
        <span className="text-sm">
          <strong>{t('quickInfo.price')}:</strong> {formatRupiah(product.harga)}
        </span>
        <span className="text-sm">
          <strong>{t('quickInfo.category')}:</strong> {product.category?.nama ?? '—'}
        </span>
        <NLink
          href={`/admin/products`}
          variant="primary"
          underline="static"
          className="ml-auto text-xs"
        >
          {t('quickInfo.backToList')}
        </NLink>
      </Card>

      <Card variant="surface" className="p-6 md:p-8">
        <ProductForm categories={categories} initial={product} availablePosts={availablePosts} />
      </Card>

      {/* Preview images — separate section, managed by client component */}
      <Card variant="surface" className="p-6 md:p-8">
        <div className="border-b-2 border-ink pb-3 mb-5">
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
            {t('previewImagesEyebrow')}
          </p>
          <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">
            {t('previewImagesTitle')}
          </h2>
        </div>
        <p className="text-sm text-ink/60 mb-4">
          {t('previewImagesSubtitle')}
        </p>
        <PreviewImagesManager
          productId={productId}
          initial={product.preview_images ?? []}
          apiUrl={apiUrl}
        />
      </Card>
    </div>
  );
}