'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { AlertBanner } from '@/components/ui/AlertBanner';
import { FormFooter } from '@/components/ui';
import { FormField } from '@/components/admin/FormField';
import { SelectSearch } from '@/components/ui/SelectSearch';
import { Textarea } from '@/components/ui/Textarea';
import { Icon } from '@/components/ui';
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
      <FormField label={t('fields.status')} required>
        <SelectSearch
          name="status"
          defaultValue={customRequest.status}
          required
          options={[
            { value: 'baru', label: t('status.baru') },
            { value: 'diproses', label: t('status.diproses') },
            { value: 'selesai', label: t('status.selesai') },
            { value: 'dibatalkan', label: t('status.dibatalkan') },
          ]}
        />
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
          <Icon name="check" size={14} className="mr-1" />
          {t('updateSuccess')}
        </AlertBanner>
      )}

      {state.error && (
        <AlertBanner variant="error">
          {state.error}
        </AlertBanner>
      )}

      <FormFooter
        pending={pending}
        submitLabel={pending ? t('submitting') : tBtns('save')}
      />
    </form>
  );
}
