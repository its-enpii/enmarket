import { apiGet } from '@/lib/api';
import type { Category, SingleResponse } from '@/lib/types';

import { ProductForm } from '../ProductForm';

export const metadata = {
  title: 'Produk Baru — Admin',
};

async function loadCategories() {
  try {
    const res = await apiGet<SingleResponse<Category[]>>('/api/admin/categories');
    return res.data ?? [];
  } catch {
    return [];
  }
}

export default async function NewProductPage() {
  const categories = await loadCategories();

  return (
    <div className="p-8 max-w-4xl">
      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)]">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}