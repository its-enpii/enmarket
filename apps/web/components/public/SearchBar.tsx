'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/neobrutal';
import { Input } from '@/components/ui/Input';

/**
 * Search bar — submit GET form ke basePath?q=...
 * Preserve filter params existing (category/tipe) saat ada.
 *
 * Default basePath: `/katalog` (backward compat dengan halaman legacy).
 * Untuk Develop page → set basePath="/develop".
 *
 * Variant:
 *   - default : horizontal (untuk area lebar / header bar)
 *   - compact : vertical stack (untuk sidebar sempit)
 */
interface Props {
  defaultValue?: string;
  variant?: 'default' | 'compact';
  /** Path tujuan submit. Default '/katalog'. */
  basePath?: string;
  /** Placeholder input. Default 'Cari produk…'. */
  placeholder?: string;
  /** Label tombol submit. Default 'Cari'. */
  submitLabel?: string;
  /** Show icon emoji di submit button. */
  showIcon?: boolean;
}

export function SearchBar({
  defaultValue = '',
  variant = 'default',
  basePath = '/katalog',
  placeholder = 'Cari produk…',
  submitLabel = 'Cari',
  showIcon = true,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(defaultValue);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const sp = new URLSearchParams(params.toString());
    if (q.trim()) {
      sp.set('q', q.trim());
    } else {
      sp.delete('q');
    }
    sp.delete('page'); // reset pagination
    const qs = sp.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  const isCompact = variant === 'compact';
  const icon = showIcon ? '🔍 ' : '';

  return (
    <form onSubmit={onSubmit} className={isCompact ? 'flex flex-col gap-2' : 'flex gap-2'}>
      <Input
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        variant={isCompact ? 'default' : 'sm'}
        className={isCompact ? 'w-full' : 'flex-1'}
      />
      <Button
        type="submit"
        variant="primary"
        size={isCompact ? 'md' : 'sm'}
        flat={isCompact ? true : false}
        className={isCompact ? 'w-full' : ''}
      >
        {isCompact ? `${icon}${submitLabel}` : submitLabel}
      </Button>
    </form>
  );
}