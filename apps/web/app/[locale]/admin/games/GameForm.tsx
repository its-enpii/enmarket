'use client';

import React, { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import type { Game } from '@/lib/types';
import type { ActionResult } from './actions';
import { createGame, updateGame } from './actions';

interface Props {
  game?: Game;
}

export function GameForm({ game }: Props) {
  const t = useTranslations('admin.games.field');
  const isEdit = !!game;

  const action = isEdit
    ? updateGame.bind(null, game!.id)
    : createGame;

  const [state, formAction, pending] = useActionState(action, {} as ActionResult);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="border-4 border-red-500 bg-red-50 p-3 text-red-700 text-sm font-bold">
          {state.error}
        </div>
      )}

      <div>
        <label className="font-label text-xs uppercase font-bold block mb-1">{t('nama')}</label>
        <Input name="nama" defaultValue={game?.nama ?? ''} required />
      </div>

      <div>
        <label className="font-label text-xs uppercase font-bold block mb-1">{t('slug')}</label>
        <Input name="slug" defaultValue={game?.slug ?? ''} placeholder="auto-generate dari nama" />
      </div>

      <div>
        <label className="font-label text-xs uppercase font-bold block mb-1">{t('brand')}</label>
        <Input name="brand" defaultValue={game?.brand ?? ''} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-label text-xs uppercase font-bold block mb-1">{t('iconUrl')}</label>
          <Input name="icon_url" defaultValue={game?.icon_url ?? ''} />
        </div>
        <div>
          <label className="font-label text-xs uppercase font-bold block mb-1">{t('bannerUrl')}</label>
          <Input name="banner_url" defaultValue={game?.banner_url ?? ''} />
        </div>
      </div>

      <div>
        <label className="font-label text-xs uppercase font-bold block mb-1">{t('description')}</label>
        <Textarea name="description" defaultValue={game?.description ?? ''} rows={3} />
      </div>

      <div>
        <label className="font-label text-xs uppercase font-bold block mb-1">{t('digiflazzCategory')}</label>
        <Input name="digiflazz_category" defaultValue={game?.digiflazz_category ?? ''} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-label text-xs uppercase font-bold block mb-1">{t('sortOrder')}</label>
          <Input name="sort_order" type="number" defaultValue={String(game?.sort_order ?? 0)} />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Checkbox name="requires_server_id" value="true" defaultChecked={game?.requires_server_id ?? false} label={t('requiresServerId')} />
        <Checkbox name="active" value="true" defaultChecked={game?.active ?? true} label={t('active')} />
      </div>

      <div className="pt-4 border-t-2 border-ink">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? '...' : isEdit ? 'Simpan' : 'Buat Game'}
        </Button>
      </div>
    </form>
  );
}
