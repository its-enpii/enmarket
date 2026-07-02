import { logoutAction } from '@/app/admin/actions';

interface Props {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: Props) {
  return (
    <header className="bg-surface border-b-4 border-ink px-8 py-5 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-ink leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-ink/60 mt-0.5">{subtitle}</p>
        )}
      </div>

      <form action={logoutAction}>
        <button
          type="submit"
          className="bg-surface border-2 border-ink px-4 py-2 text-sm font-bold text-ink shadow-[3px_3px_0_0_var(--color-ink)] hover:bg-accent hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
        >
          Logout
        </button>
      </form>
    </header>
  );
}