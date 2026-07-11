import { notFound } from 'next/navigation';
import Link from 'next/link';

import { PreviewImagesManager } from '@/components/admin/PreviewImagesManager';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Card } from '@/components/ui/neobrutal';
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
    <div className="p-6 sm:p-8 space-y-6">
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
          ✎ Studio / Katalog / Edit
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
          {product.nama}<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          Sunting produk. Perubahan langsung tersimpan setelah klik Simpan.
        </p>
      </header>

      {/* Quick info */}
      <Card variant="surface" className="p-4 flex flex-wrap items-center gap-3">
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
      </Card>

      <Card variant="surface" className="p-6 md:p-8">
        <ProductForm categories={categories} initial={product} />
      </Card>

      {/* Preview images — separate section, managed by client component */}
      <Card variant="surface" className="p-6 md:p-8">
        <div className="border-b-2 border-ink pb-3 mb-5">
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
            ✎ Media
          </p>
          <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">
            Preview Images
          </h2>
        </div>
        <p className="text-sm text-ink/60 mb-4">
          Gambar yang tampil di halaman detail produk. Maks 5.
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