interface Stat {
  value: string;
  label: string;
  /** Warna tile — biar tidak monoton */
  tone?: 'primary' | 'accent' | 'ink';
}

interface Props {
  stats: Stat[];
}

/**
 * Strip angka — social proof untuk marketplace.
 * Tile NeoBrutalism, warna selang-seling biar ritme visual.
 *
 * Jangan render jika kosong — biar tidak muncul blok sia-sia.
 */
export function StatsBar({ stats }: Props) {
  if (stats.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s, i) => {
        const tone: NonNullable<Stat['tone']> = s.tone ?? (i % 3 === 0 ? 'primary' : i % 3 === 1 ? 'accent' : 'ink');
        const tileClass =
          tone === 'primary'
            ? 'bg-primary text-surface'
            : tone === 'accent'
              ? 'bg-accent text-ink'
              : 'bg-ink text-surface';
        return (
          <li
            key={i}
            className={`${tileClass} border-2 border-ink p-3 sm:p-4 shadow-[4px_4px_0_0_var(--color-ink)] text-center`}
          >
            <p className="font-mono text-2xl sm:text-3xl font-bold leading-none">{s.value}</p>
            <p className="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-80">
              {s.label}
            </p>
          </li>
        );
      })}
    </ul>
  );
}