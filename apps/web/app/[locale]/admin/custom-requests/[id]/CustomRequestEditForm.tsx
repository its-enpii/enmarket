'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { Button, Card } from '@/components/ui/neobrutal';
import { FormField } from '@/components/admin/FormField';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { CustomRequest } from '@/lib/types';

import { updateCustomRequestAction, UpdateCustomRequestResult } from '../actions';

interface Props {
  customRequest: CustomRequest;
}

export function CustomRequestEditForm({ customRequest }: Props) {
  const t = useTranslations('admin.customRequests');
  const tBtns = useTranslations('common.buttons');

  const [state, formAction, pending] = useActionState<UpdateCustomRequestResult, FormData>(
    async (prev, fd) => updateCustomRequestAction(customRequest.id, prev, fd),
    {} as UpdateCustomRequestResult,
  );

  return (
    <form action={formAction} className="space-y-5">
      <FormField label={t('fields.status')} htmlFor="status" required>
        <Select id="status" name="status" defaultValue={customRequest.status}>
          <option value="baru">{t('status.baru')}</option>
          <option value="diproses">{t('status.diproses')}</option>
          <option value="selesai">{t('status.selesai')}</option>
          <option value="dibatalkan">{t('status.dibatalkan')}</option>
        </Select>
      </FormField>

      <FormField label={t('fields.notes')} htmlFor="notes" hint={t('fields.notesHint')}>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={customRequest.notes ?? ''}
          placeholder={t('fields.notesPlaceholder')}
        />
      </FormField>

      {state.success && (
        <Card variant="filled-primary" hoverable={false} className="px-4 py-2 text-sm font-bold text-surface">
          ✓ {t('updateSuccess')}
        </Card>
      )}

      {state.error && (
        <Card variant="filled-accent" hoverable={false} className="px-4 py-2 text-sm font-bold">
          {state.error}
        </Card>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? t('submitting') : tBtns('save')}
        </Button>
      </div>
    </form>
  );
}
