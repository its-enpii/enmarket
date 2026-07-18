'use client';

/**
 * Footer admin — branding enpiistudio + link public store.
 * Konsisten dengan public Footer (border-t-4 ink, surface bg) tapi lebih ringkas.
 */
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/Badge';

export function AdminFooter() {
  const t = useTranslations('admin.footer');
  return (
    <footer className="border-t-4 border-ink bg-surface mt-auto">
      <div className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-ink/60">
        <p>
          <Badge tone="primary" size="sm" shadow={false} className="mr-1.5 px-1.5 py-0.5 !text-[10px] font-bold uppercase tracking-wide">
            enpii
          </Badge>
          <span className="font-bold text-ink">{t('brand')}</span>
          <span className="ml-2">{t('store')}</span>
        </p>
        <div className="flex gap-3">
          <a
            href="https://github.com/enpiistudio/enmarket"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink font-bold"
          >
            GitHub
          </a>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink font-bold"
          >
            {t('viewStore')}
          </a>
        </div>
      </div>
    </footer>
  );
}