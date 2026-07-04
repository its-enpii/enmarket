'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/admin/Button';
import { Input } from '@/components/ui/Input';

/**
 * Search bar — submit GET form ke /katalog?q=...
 * Pertahankan category filter kalau ada.
 *
 * Pakai variant default (horizontal) untuk area lebar.
 * Pakai compact (stack vertical) untuk sidebar sempit.
 */
interface Props {
  defaultValue?: string;
  variant?: 'default' | 'compact';
}

export function SearchBar({ defaultValue = '', variant = 'default' }: Props) {
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
    router.push(qs ? `/katalog?${qs}` : '/katalog');
  }

  const isCompact = variant === 'compact';

  return (
    <form onSubmit={onSubmit} className={isCompact ? 'flex flex-col gap-2' : 'flex gap-2'}>
      <Input
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari produk…"
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
        {isCompact ? '🔍 Cari' : 'Cari'}
      </Button>
    </form>
  );
}