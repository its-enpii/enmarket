'use client';

import { useTranslations } from 'next-intl';

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
 * Kalau value = 0, render label "Gratis" dari translation key 'product.price.free'.
 */
export function PriceTag({ value, size = 'md' }: Props) {
  const t = useTranslations('product.price');
  const isFree = Number.parseFloat(value) === 0;

  return (
    <p className={`font-bold text-primary ${SIZE[size]} leading-none`}>
      {isFree ? t('free') : formatRupiah(value)}
    </p>
  );
}