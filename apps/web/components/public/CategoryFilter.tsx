import { NLink } from '@/components/ui/neobrutal';
import { getTranslations } from 'next-intl/server';

import type { Category } from '@/lib/types';

interface Props {
  categories: Category[];
  activeSlug?: string;
}

/**
 * Sidebar filter kategori — chip list.
 * Tampilkan semua kategori + link "Semua" untuk reset.
 */
export async function CategoryFilter({ categories, activeSlug }: Props) {
  const t = await getTranslations('katalog');

  return (
    <aside className="bg-surface border-2 border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)]">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-ink">
        {t('categoryLabel')}
      </h2>
      <ul className="flex flex-col gap-2">
        <li>
          <NLink
            href="/katalog"
            variant="default"
            underline="none"
            className={`block border-2 border-ink px-3 py-2 text-sm font-bold transition-all ${
              !activeSlug
                ? 'bg-primary text-surface shadow-[2px_2px_0_0_var(--color-ink)]'
                : 'bg-surface text-ink hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_var(--color-ink)]'
            }`}
          >
            {t('allCategories')}
          </NLink>
        </li>
        {categories.map((cat) => {
          const isActive = cat.slug === activeSlug;
          return (
            <li key={cat.id}>
              <NLink
                href={`/katalog?category=${cat.slug}`}
                variant="default"
                underline="none"
                className={`flex items-center justify-between gap-2 border-2 border-ink px-3 py-2 text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-surface shadow-[2px_2px_0_0_var(--color-ink)]'
                    : 'bg-surface text-ink hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_var(--color-ink)]'
                }`}
              >
                <span className="truncate">{cat.nama}</span>
                {typeof cat.products_count === 'number' && (
                  <span
                    className={
                      'shrink-0 text-xs ' + (isActive ? 'text-surface/80' : 'text-ink/60')
                    }
                  >
                    {cat.products_count}
                  </span>
                )}
              </NLink>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
