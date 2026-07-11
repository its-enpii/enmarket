import { Card } from '@/components/ui/neobrutal';

import { CategoryForm } from '../CategoryForm';

export const metadata = {
  title: 'Kategori Baru — Admin',
};

export default function NewCategoryPage() {
  return (
    <div className="p-6 sm:p-8 space-y-6">
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
          ✎ Studio / Katalog
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
          Kategori Baru<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          Buat pengelompokan produk baru. Slug akan otomatis dibuat dari nama.
        </p>
      </header>

      <Card variant="surface" className="p-6 md:p-8 max-w-2xl">
        <CategoryForm />
      </Card>
    </div>
  );
}