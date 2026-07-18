import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { STATUS_LABEL } from '@/lib/format';

interface Props {
  status: string;
  /**
   * Override label lookup. Default pakai STATUS_LABEL untuk produk.
   * Pakai LICENSE_STATUS_LABEL / ORDER_STATUS_LABEL untuk entity lain.
   */
  labelMap?: Record<string, string>;
  /**
   * Override background+text color per status key (legacy: tailwind class string).
   * Unknown values fall back ke default palette. Pakai BadgeTone key ('accent'|
   * 'primary'|'ink'|'surface') untuk explicit mapping.
   */
  bgOverride?: Record<string, string>;
}

const VALID_TONES: ReadonlySet<BadgeTone> = new Set(['accent', 'primary', 'ink', 'surface']);

/**
 * Default product palette (NeoBrutalism-friendly).
 */
const DEFAULT_TONE: Record<string, BadgeTone> = {
  aktif: 'accent',
  draft: 'surface',
  tidak_dijual: 'ink',
};

export function StatusBadge({ status, labelMap, bgOverride }: Props) {
  const raw = bgOverride?.[status];
  const tone: BadgeTone =
    (raw && VALID_TONES.has(raw as BadgeTone) ? (raw as BadgeTone) : null) ??
    DEFAULT_TONE[status] ??
    'surface';
  const label = labelMap?.[status] ?? STATUS_LABEL[status] ?? status;

  return (
    <Badge tone={tone} size="sm" shadow={false} className="font-bold tracking-wide">
      {label}
    </Badge>
  );
}