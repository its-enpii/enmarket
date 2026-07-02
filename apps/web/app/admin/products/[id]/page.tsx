import { notFound } from 'next/navigation';
import Link from 'next/link';

import { Topbar } from '@/components/admin/Topbar';
import { PreviewImagesManager } from '@/components/admin/PreviewImagesManager';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ApiRequestError, apiGet } from '@/lib/api';
import { TIPE_LABEL, formatDateTime, formatRupiah } from '@/lib/format';
import type { Category, Product, SingleResponse } from '@/lib/types';

import { ProductForm } from '../ProductForm';

interface Props {
  params: Promise<{ id: string }>;
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

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);

  const [product, categories] = await Promise.all([
    loadProduct(id),
    loadCategories(),
  ]);

  if (!product) notFound();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <>
      <Topbar
        title={`Edit: ${product.nama}`}
        subtitle={`Slug: ${product.slug} • Update terakhir ${formatDateTime(product.updated_at)}`}
      />

      <div className="p-8 max-w-4xl space-y-6">
        {/* Quick info */}
        <div className="bg-surface border-2 border-ink p-4 shadow-[3px_3px_0_0_var(--color-ink)] flex flex-wrap items-center gap-3">
          <StatusBadge status={product.status} />
          <span className="text-sm">
            <strong>Tipe:</strong> {TIPE_LABEL[product.tipe] ?? product.tipe}
          </span>
          <span className="text-sm">
            <strong>Harga:</strong> {formatRupiah(product.harga)}
          </span>
          <span className="text-sm">
            <strong>Kategori:</strong> {product.category?.nama ?? '—'}
          </span>
          <Link
            href={`/admin/products`}
            className="ml-auto text-xs underline text-primary font-bold hover:text-accent"
          >
            ← Kembali ke daftar
          </Link>
        </div>

        <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)]">
          <ProductForm categories={categories} initial={product} />
        </div>

        {/* Preview images — separate section, managed by client component */}
        <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)]">
          <h2 className="text-lg font-bold mb-1">Preview Images</h2>
          <p className="text-sm text-ink/60 mb-4">
            Gambar yang tampil di halaman detail produk. Maks 5.
          </p>
          <PreviewImagesManager
            productId={productId}
            initial={product.preview_images ?? []}
            apiUrl={apiUrl}
          />
        </div>
      </div>
    </>
  );
}