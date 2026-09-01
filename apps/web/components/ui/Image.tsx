import type { ImgHTMLAttributes } from 'react';

/**
 * Image — komponen gambar standar situs. Menyatukan default yang sebelumnya
 * di-copy-paste: lazy loading + object-cover + alt wajib.
 * Untuk efek grayscale-on-hover gunakan HoverImage.
 */
type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'> & {
  alt: string;
  /** object-contain (QR code, logo) — default object-cover. */
  contain?: boolean;
};

export function Image({ contain = false, className = '', loading = 'lazy', ...rest }: ImageProps) {
  const fit = contain ? 'object-contain' : 'object-cover';
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <Image
      loading={loading}
      className={`${fit} ${className}`}
      {...rest}
    />
  );
}
