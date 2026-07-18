import { getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/neobrutal';
import type { PaginationMeta } from '@/lib/types';

interface Props {
  meta: PaginationMeta;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}

/**
 * Pagination — server component, translated.
 */
export async function Pagination({ meta, basePath, searchParams }: Props) {
  if (meta.last_page <= 1) return null;
  const t = await getTranslations('common.pagination');

  function buildHref(page: number): string {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v) sp.set(k, v);
    }
    sp.set('page', String(page));
    return `${basePath}?${sp.toString()}`;
  }

  const pages: number[] = [];
  for (let i = 1; i <= meta.last_page; i++) pages.push(i);

  const isPrevDisabled = meta.current_page <= 1;
  const isNextDisabled = meta.current_page >= meta.last_page;

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label={t('label')}>
      <Button
        size="sm"
        variant="surface"
        href={buildHref(Math.max(1, meta.current_page - 1))}
        aria-disabled={isPrevDisabled}
        className={`text-sm ${isPrevDisabled ? 'opacity-40 pointer-events-none' : ''}`}
      >
        {t('prev')}
      </Button>

      {pages.map((p) => {
        const isActive = p === meta.current_page;
        return isActive ? (
          <Badge
            key={p}
            tone="primary"
            size="md"
            shadow={false}
            aria-current="page"
            className="cursor-default min-h-[40px] text-sm normal-case tracking-normal"
          >
            {p}
          </Badge>
        ) : (
          <Button
            key={p}
            size="sm"
            variant="surface"
            href={buildHref(p)}
            className="text-sm"
          >
            {p}
          </Button>
        );
      })}

      <Button
        size="sm"
        variant="surface"
        href={buildHref(Math.min(meta.last_page, meta.current_page + 1))}
        aria-disabled={isNextDisabled}
        className={`text-sm ${isNextDisabled ? 'opacity-40 pointer-events-none' : ''}`}
      >
        {t('next')}
      </Button>
    </nav>
  );
}