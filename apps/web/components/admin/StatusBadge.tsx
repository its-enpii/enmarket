import { STATUS_LABEL } from '@/lib/format';

interface Props {
  status: string;
  /**
   * Override label lookup. Default pakai STATUS_LABEL untuk produk.
   * Pakai LICENSE_STATUS_LABEL / ORDER_STATUS_LABEL untuk entity lain.
   */
  labelMap?: Record<string, string>;
  /**
   * Override background+text color per status key.
   * Kalau tidak ada, pakai default product palette.
   */
  bgOverride?: Record<string, string>;
}

/**
 * Default product palette (NeoBrutalism-friendly).
 */
const DEFAULT_BG: Record<string, string> = {
  aktif: 'bg-accent text-ink',
  draft: 'bg-surface text-ink',
  tidak_dijual: 'bg-ink text-surface',
};

export function StatusBadge({ status, labelMap, bgOverride }: Props) {
  const bg = bgOverride?.[status] ?? DEFAULT_BG[status] ?? 'bg-surface text-ink';
  const label = labelMap?.[status] ?? STATUS_LABEL[status] ?? status;

  return (
    <span
      className={
        'inline-block border-2 border-ink px-2 py-0.5 text-xs font-bold uppercase tracking-wide ' +
        bg
      }
    >
      {label}
    </span>
  );
}