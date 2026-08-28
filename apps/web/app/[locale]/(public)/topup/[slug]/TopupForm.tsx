'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import { Button, Card } from '@/components/ui/neobrutal';
import { Input } from '@/components/ui/Input';
import { Radio } from '@/components/ui/Radio';
import type { Game, GameItem } from '@/lib/types';
import { topupApi } from '@/lib/topup-api';
import { formatRupiah } from '@/lib/format';

interface Props {
  game: Game;
}

export function TopupForm({ game }: Props) {
  const t = useTranslations('topup');
  const router = useRouter();

  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [userId, setUserId] = useState('');
  const [serverId, setServerId] = useState('');
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');
  const [contactValue, setContactValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = game.items ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId.trim()) {
      setError(t('errors.userIdRequired'));
      return;
    }
    if (game.requires_server_id && !serverId.trim()) {
      setError(t('errors.serverIdRequired'));
      return;
    }
    if (!contactValue.trim()) {
      setError(t('errors.contactRequired'));
      return;
    }
    if (!selectedItem) {
      setError(t('errors.itemRequired'));
      return;
    }

    setLoading(true);
    try {
      const res = await topupApi.checkoutTopup({
        game_id: game.id,
        game_item_id: selectedItem.id,
        user_id: userId,
        server_id: game.requires_server_id ? serverId : undefined,
        contact_type: contactType,
        contact_value: contactValue,
        payment_gateway: 'tripay',
      });

      if (res.data?.redirect_url) {
        router.push(res.data.redirect_url);
      } else {
        router.push('/topup/success');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout gagal';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nominal selection */}
      <div>
        <h3 className="font-label text-label-sm uppercase font-bold mb-3">{t('pickItem')}</h3>
        {items.length === 0 ? (
          <p className="text-ink/60 text-sm">{t('noItems')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className={`p-3 border-4 text-left transition-all ${
                  selectedItem?.id === item.id
                    ? 'border-primary bg-primary/10 shadow-[4px_4px_0_0_var(--color-primary)]'
                    : 'border-ink bg-surface hover:shadow-[4px_4px_0_0_var(--color-ink)]'
                }`}
              >
                <p className="font-bold text-sm text-ink">{item.nama}</p>
                <p className="text-xs text-ink/70 mt-1">{formatRupiah(item.harga)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User ID */}
      <div>
        <label className="font-label text-label-sm uppercase font-bold block mb-2">
          {t('userId')}
        </label>
        <Input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder={t('userIdHint')}
        />
      </div>

      {/* Server ID (conditional) */}
      {game.requires_server_id && (
        <div>
          <label className="font-label text-label-sm uppercase font-bold block mb-2">
            {t('serverId')}
          </label>
          <Input
            value={serverId}
            onChange={(e) => setServerId(e.target.value)}
            placeholder={t('serverIdHint')}
          />
        </div>
      )}

      {/* Contact */}
      <div>
        <label className="font-label text-label-sm uppercase font-bold block mb-2">
          {t('contactLabel')}
        </label>
        <div className="flex gap-4 mb-3">
          <Radio
            name="contact_type"
            value="phone"
            label={t('contactPhone')}
            checked={contactType === 'phone'}
            onChange={() => setContactType('phone')}
          />
          <Radio
            name="contact_type"
            value="email"
            label={t('contactEmail')}
            checked={contactType === 'email'}
            onChange={() => setContactType('email')}
          />
        </div>
        <Input
          type={contactType === 'email' ? 'email' : 'tel'}
          value={contactValue}
          onChange={(e) => setContactValue(e.target.value)}
          placeholder={contactType === 'phone' ? '08xxxxxxxxxx' : 'email@example.com'}
        />
      </div>

      {/* Summary */}
      {selectedItem && (
        <Card variant="filled-accent" hoverable={false} className="p-4">
          <h4 className="font-bold text-sm mb-2">{t('previewTitle')}</h4>
          <div className="flex justify-between text-sm">
            <span>{game.nama} — {selectedItem.nama}</span>
            <span className="font-bold">{formatRupiah(selectedItem.harga)}</span>
          </div>
        </Card>
      )}

      {error && (
        <div className="border-4 border-red-500 bg-red-50 p-3 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={loading || !selectedItem}
        className="w-full"
      >
        {loading ? t('processing') : t('payNow')}
      </Button>
    </form>
  );
}
