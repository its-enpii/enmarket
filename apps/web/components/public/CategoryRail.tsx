import { Badge } from '@/components/ui/Badge';
import { Button, Card, NLink } from '@/components/ui/neobrutal';

import type { Category } from '@/lib/types';

interface Props {
  categories: Category[];
}

/**
 * Rail kategori untuk homepage — chip horizontal scrollable.
 * Beda dari CategoryFilter (sidebar katalog): versi ini ringkas, fokus
 * pada discovery cepat.
 */
export function CategoryRail({ categories }: Props) {
  const isEmpty = categories.length === 0;
  const displayCategories = isEmpty
    ? [
        { id: -1, nama: 'Kategori A', slug: 'kategori-a', products_count: 12 } as Category,
        { id: -2, nama: 'Kategori B', slug: 'kategori-b', products_count: 8 } as Category,
        { id: -3, nama: 'Kategori C', slug: 'kategori-c', products_count: 5 } as Category,
        { id: -4, nama: 'Kategori D', slug: 'kategori-d', products_count: 7 } as Category,
        { id: -5, nama: 'Kategori E', slug: 'kategori-e', products_count: 4 } as Category,
      ]
    : categories;

  return (
    <Card
      as="section"
      aria-label="Kategori populer"
      variant="surface"
      hoverable={false}
      className="!shadow-[4px_4px_0_0_var(--color-ink)]"
    >
      <div className="flex items-center justify-between gap-2 border-b-2 border-ink px-4 py-3">
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-ink">
          Jelajahi Kategori
        </h2>
        <NLink
          href="/katalog"
          variant="primary"
          underline="static"
          arrow
          className="text-xs"
        >
          Lihat semua
        </NLink>
      </div>
      <div className="px-3 py-3 overflow-x-auto scrollbar-none">
        <ul className="flex items-stretch gap-3 min-w-min">
          {displayCategories.map((cat) => (
            <li key={cat.id} className="shrink-0">
              <Button
                href={`/katalog?category=${cat.slug}`}
                variant="surface"
                size="sm"
                className="hover:bg-accent"
              >
                <Badge tone="primary" size="sm" shadow={false} aria-hidden="true" className="!w-9 !h-9 !p-0 justify-center font-bold text-base">
                  {cat.nama.charAt(0).toUpperCase()}
                </Badge>
                <span className="flex flex-col text-left">
                  <span className="font-bold text-sm leading-tight">{cat.nama}</span>
                  {typeof cat.products_count === 'number' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink/60">
                      {cat.products_count} karya
                    </span>
                  )}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </div>
      {isEmpty && (
        <p className="text-[10px] text-ink/50 px-4 pb-3 italic">
          *Contoh kategori — data asli akan tampil setelah admin menambah karya.
        </p>
      )}
    </Card>
  );
}
