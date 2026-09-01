'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { AlertBanner } from '@/components/ui/AlertBanner';
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
        <AlertBanner variant="success">
          ✓ {t('updateSuccess')}
        </AlertBanner>
      )}

      {state.error && (
        <AlertBanner variant="error">
          {state.error}
        </AlertBanner>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? t('submitting') : tBtns('save')}
        </Button>
      </div>
    </form>
  );
}
