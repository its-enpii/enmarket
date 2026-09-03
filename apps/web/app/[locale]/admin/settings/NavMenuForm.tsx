'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { Button, Card } from '@/components/ui/neobrutal';
import { Checkbox } from '@/components/ui/Checkbox';
import { FormError } from '@/components/ui/FormMessage';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/toast-store';
import { FormActions, FormSection, Text } from '@/components/ui';
import { EMPTY_ACTION_RESULT } from '@/lib/action-result';
import type { NavMenuRecord } from '@/lib/types';

import { updateNavMenus, type SettingsActionResult } from './actions';

interface Props {
  initial: NavMenuRecord[];
}

export function NavMenuForm({ initial }: Props) {
  const t = useTranslations('admin.settings.navigation');
  const [state, action, pending] = useActionState<SettingsActionResult, FormData>(
    async (previous, formData) => {
      const result = await updateNavMenus(previous, formData);
      if (result.ok) toast.success(t('success'));
      return result;
    },
    EMPTY_ACTION_RESULT,
  );

  return (
    <Card variant="surface" className="p-6 space-y-6">
      <FormSection eyebrow={t('sectionMenus')} title={t('sectionMenusTitle')} />

      <form action={action} className="space-y-5">
        <FormError variant="box">{state.error ? t('saveFailed') : null}</FormError>

        {initial.map((menu) => (
          <input key={`${menu.id}-id`} type="hidden" name="nav_menu_ids" value={menu.id} />
        ))}

        {initial.map((menu) => (
          <div
            key={menu.id}
            className="grid gap-4 border-b-2 border-ink pb-5 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:items-start"
          >
            <input type="hidden" name={`sort_order_${menu.id}`} value={menu.sort_order} />
            <Card as="label" variant="surface" hoverable={false} className="flex h-full items-center gap-4 p-3 cursor-pointer">
              <Checkbox name={`enabled_${menu.id}`} defaultChecked={menu.is_enabled} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-black uppercase text-ink">{t(`menu_${menu.key}`)}</p>
                <Text as="p" variant="muted" className="mt-0.5 font-body">{t('menuEnabledHint')}</Text>
              </div>
            </Card>

            <FormField
              label={t('fieldLabelOverride')}
              htmlFor={`label_${menu.id}`}
              hint={t('fieldLabelOverrideHint')}
              error={state.fieldErrors?.label ? t('fieldInvalid') : undefined}
            >
              <Input
                id={`label_${menu.id}`}
                name={`label_${menu.id}`}
                type="text"
                defaultValue={menu.label ?? ''}
                maxLength={100}
                placeholder={t(`menu_${menu.key}`)}
              />
            </FormField>
          </div>
        ))}

        <FormActions>
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? t('submitPending') : t('submit')}
          </Button>
        </FormActions>
      </form>
    </Card>
  );
}
