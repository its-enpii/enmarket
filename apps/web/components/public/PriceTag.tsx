import { formatRupiah } from '@/lib/format';

interface Props {
  value: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl sm:text-5xl',
} as const;

/**
 * Harga dengan style NeoBrutalism — font besar bold warna primary.
 */
export function PriceTag({ value, size = 'md' }: Props) {
  return (
    <p className={`font-bold text-primary ${SIZE[size]} leading-none`}>
      {formatRupiah(value)}
    </p>
  );
}