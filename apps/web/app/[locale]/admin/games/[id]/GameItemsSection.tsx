'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Button, Card } from '@/components/ui/neobrutal';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { formatRupiah } from '@/lib/format';
import type { Game, GameItem } from '@/lib/types';
import { fetchWithAuth } from '@/lib/auth';

interface Props {
  game: Game;
}

export function GameItemsSection({ game }: Props) {
  const t = useTranslations('admin.games.items');
  const [items, setItems] = useState<GameItem[]>(game.items ?? []);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [sku, setSku] = useState('');

  const handleAdd = async () => {
    if (!nama || !harga || !sku) return;
    setSaving(true);
    try {
      const res = await fetchWithAuth<{ data: GameItem }>(`/api/admin/games/${game.id}/items`, {
        method: 'POST',
        body: JSON.stringify({ nama, harga: parseFloat(harga), digiflazz_sku: sku }),
      });
      setItems((prev) => [...prev, res.data]);
      setNama('');
      setHarga('');
      setSku('');
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    try {
      await fetchWithAuth(`/api/admin/items/${itemId}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card variant="surface" hoverable={false} className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-black text-ink">{t('title')}</h2>
        <Button type="button" variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
          {t('add')}
        </Button>
      </div>

      {showForm && (
        <div className="border-4 border-ink p-4 mb-4 space-y-3 bg-accent/10">
          <FormField label={t('nama')} htmlFor="game-item-nama">
            <Input id="game-item-nama" value={nama} onChange={(e) => setNama(e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label={t('harga')} htmlFor="game-item-harga">
              <Input id="game-item-harga" type="number" value={harga} onChange={(e) => setHarga(e.target.value)} />
            </FormField>
            <FormField label={t('sku')} htmlFor="game-item-sku">
              <Input id="game-item-sku" value={sku} onChange={(e) => setSku(e.target.value)} />
            </FormField>
          </div>
          <Button type="button" variant="primary" size="sm" disabled={saving} onClick={handleAdd}>
            {saving ? '...' : t('add')}
          </Button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-ink/60 text-sm">{t('empty')}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-2 border-ink p-3">
              <div>
                <p className="font-bold text-sm">{item.nama}</p>
                <p className="text-xs text-ink/60">{item.digiflazz_sku} · {formatRupiah(item.harga)}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                tone="danger"
                onClick={() => handleDelete(item.id)}
                className="text-xs"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
