import { CategoryForm } from '../CategoryForm';

export const metadata = {
  title: 'Kategori Baru — Admin',
};

export default function NewCategoryPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="bg-surface border-2 border-ink p-6 shadow-[4px_4px_0_0_var(--color-ink)]">
        <CategoryForm />
      </div>
    </div>
  );
}