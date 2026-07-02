'use client';

import { logoutAction } from '@/app/admin/actions';

import { useAdminDrawer } from './AdminDrawerContext';

interface Props {
  title: string;
  subtitle?: string;
}

/**
 * Topbar admin — title + subtitle + drawer toggle (mobile) + logout.
 */
export function Topbar({ title, subtitle }: Props) {
  const drawer = useAdminDrawer();

  return (
    <header className="bg-surface border-b-4 border-ink px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {drawer && (
          <button
            type="button"
            onClick={() => drawer.openDrawer()}
            aria-label="Open menu"
            className="lg:hidden border-2 border-ink bg-surface text-ink w-11 h-11 inline-flex items-center justify-center font-bold shadow-[3px_3px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--color-ink)] transition-all"
          >
            ☰
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-ink leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-ink/60 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <form action={logoutAction}>
        <button
          type="submit"
          className="bg-surface border-2 border-ink px-4 py-2 text-sm font-bold text-ink shadow-[3px_3px_0_0_var(--color-ink)] hover:bg-accent hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-ink)] transition-all min-h-[44px]"
        >
          Logout
        </button>
      </form>
    </header>
  );
}