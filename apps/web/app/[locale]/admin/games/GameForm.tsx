'use client';

import React, { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { FormError } from '@/components/ui/FormMessage';
import { FormField } from '@/components/ui/FormField';
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
        <FormError variant="box">{state.error}</FormError>
      )}

      <FormField label={t('nama')} htmlFor="game-nama" required>
        <Input name="nama" defaultValue={game?.nama ?? ''} required />
      </FormField>

      <FormField label={t('slug')} htmlFor="game-slug" required>
        <Input name="slug" defaultValue={game?.slug ?? ''} placeholder={t('slugPlaceholder')} />
      </FormField>

        <FormField label={t('brand')} htmlFor="game-brand">
          <Input name="brand" defaultValue={game?.brand ?? ''} />
        </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label={t('iconUrl')} htmlFor="game-icon-url">
          <Input name="icon_url" defaultValue={game?.icon_url ?? ''} />
        </FormField>
        <FormField label={t('bannerUrl')} htmlFor="game-banner-url">
          <Input name="banner_url" defaultValue={game?.banner_url ?? ''} />
        </FormField>
      </div>

      <FormField label={t('description')} htmlFor="game-description">
        <Textarea name="description" defaultValue={game?.description ?? ''} rows={3} />
      </FormField>

      <FormField label={t('digiflazzCategory')} htmlFor="game-digiflazz-category">
        <Input name="digiflazz_category" defaultValue={game?.digiflazz_category ?? ''} />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label={t('sortOrder')} htmlFor="game-sort-order">
          <Input name="sort_order" type="number" defaultValue={String(game?.sort_order ?? 0)} />
        </FormField>
      </div>

      <div className="flex items-center gap-6">
        <Checkbox name="requires_server_id" value="true" defaultChecked={game?.requires_server_id ?? false} label={t('requiresServerId')} />
        <Checkbox name="active" value="true" defaultChecked={game?.active ?? true} label={t('active')} />
      </div>

      <div className="pt-4 border-t-2 border-ink">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? '...' : isEdit ? t('save') : t('create')}
        </Button>
      </div>
    </form>
  );
}
