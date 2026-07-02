import { STATUS_LABEL } from '@/lib/format';

interface Props {
  status: 'aktif' | 'draft' | 'tidak_dijual' | string;
}

export function StatusBadge({ status }: Props) {
  const styles: Record<string, string> = {
    aktif: 'bg-accent text-ink',
    draft: 'bg-surface text-ink',
    tidak_dijual: 'bg-ink text-surface',
  };

  const cls = styles[status] ?? 'bg-surface text-ink';

  return (
    <span
      className={
        'inline-block border-2 border-ink px-2 py-0.5 text-xs font-bold uppercase tracking-wide ' +
        cls
      }
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
