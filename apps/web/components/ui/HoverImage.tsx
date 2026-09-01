import type { ImgHTMLAttributes } from 'react';

/**
 * HoverImage — <img> dengan efek grayscale yang berwarna saat hover grup.
 * Pola berulang di halaman display/journal: object-cover + grayscale
 * + group-hover:grayscale-0 + transisi panjang.
 *
 * WAJIB dipakai di dalam element dengan class `group`.
 */
interface HoverImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Tanpa efek grayscale (selalu berwarna). */
  noGrayscale?: boolean;
}

export function HoverImage({ noGrayscale = false, className = '', ...rest }: HoverImageProps) {
  const effect = noGrayscale
    ? ''
    : 'grayscale group-hover:grayscale-0 transition-all duration-700';
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      loading="lazy"
      className={`object-cover ${effect} ${className}`}
      {...rest}
    />
  );
}
