import type { HTMLAttributes } from 'react';

type CornerAccentColor = 'accent' | 'primary' | 'ink' | 'surface';

interface CornerAccentProps extends HTMLAttributes<HTMLDivElement> {
  /** Warna blok. shadow selalu ink, teks (kalau ada children) ikut kontras. */
  color?: CornerAccentColor;
  /** Ukuran kotak dalam px Tailwind (w-XX h-XX), default w-24 h-24. */
  size?: string;
  /** Elevation hard-shadow, default 6. */
  elevation?: 3 | 4 | 6 | 8;
  /** Rotasi deg, default 12. */
  rotate?: -12 | -6 | -3 | 0 | 3 | 6 | 12;
  children?: React.ReactNode;
}

const COLOR_CLS: Record<CornerAccentColor, string> = {
  accent: 'bg-accent text-ink',
  primary: 'bg-primary text-surface',
  ink: 'bg-ink text-surface',
  surface: 'bg-surface text-ink',
};

const ROTATE_CLS: Record<number, string> = {
  [-12]: '-rotate-12',
  [-6]: '-rotate-6',
  [-3]: '-rotate-3',
  0: '',
  3: 'rotate-3',
  6: 'rotate-6',
  12: 'rotate-12',
};

const SHADOW_CLS: Record<number, string> = {
  3: 'shadow-[3px_3px_0_0_var(--color-ink)]',
  4: 'shadow-[4px_4px_0_0_var(--color-ink)]',
  6: 'shadow-[6px_6px_0_0_var(--color-ink)]',
  8: 'shadow-[8px_8px_0_0_var(--color-ink)]',
};

/**
 * CornerAccent — blok dekoratif neobrutalism kecil yang nempel di sudut
 * card/hero (border-4 + hard shadow + rotate). Menerima positioning class
 * via className (absolute -bottom-6 -right-6, dsb).
 */
export function CornerAccent({
  color = 'accent',
  size = 'w-24 h-24',
  elevation = 6,
  rotate = 12,
  className = '',
  children,
  ...rest
}: CornerAccentProps) {
  return (
    <div
      aria-hidden={children ? undefined : true}
      className={`hidden md:flex ${size} ${COLOR_CLS[color]} border-4 border-ink ${SHADOW_CLS[elevation]} ${ROTATE_CLS[rotate] ?? ''} items-center justify-center font-display text-xl font-black uppercase ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
