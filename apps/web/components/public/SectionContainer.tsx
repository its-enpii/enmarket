/**
 * SectionContainer — inner wrapper for semua section publik.
 *
 * Sebelumnya: tiap section menulis `<div className="px-6 md:px-12 py-...">`
 * tanpa `max-w`, sehingga konten melar full-width di monitor lebar (1440p,
 * 4K). Wrapper ini konsistenkan gutter + batas lebar dalam satu tempat.
 *
 * Batas: 1536px (`max-w-screen-2xl`). Padding horizontal tetap
 * `px-6 md:px-12` untuk konsistensi dengan TopNav/footer.
 *
 * @example
 *   <section className="border-b-4 border-ink">
 *     <SectionContainer py="lg">
 *       <h1>...</h1>
 *     </SectionContainer>
 *   </section>
 *
 * ponytail: kalau perlu variant full-bleed (mis. peta / kanvas yang
 * boleh melar), tambah prop `bleed` yang drop `max-w`.
 */

import type { HTMLAttributes, ReactNode } from 'react';

type PySize = 'sm' | 'md' | 'lg' | 'xl' | string;

const PY_MAP: Record<string, string> = {
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16',
  lg: 'py-16 md:py-20',
  xl: 'py-16 md:py-24',
};

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  children: ReactNode;
  /** Vertical padding preset. Pakai raw Tailwind class kalau perlu custom. */
  py?: PySize;
  /** Class tambahan untuk kasus khusus (e.g. override padding horizontal). */
  className?: string;
}

export function SectionContainer({
  children,
  py = 'lg',
  className = '',
  ...rest
}: Props) {
  const pyCls = PY_MAP[py] ?? py;

  return (
    <div
      className={`mx-auto max-w-screen-2xl px-6 md:px-12 ${pyCls} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
