'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import type { Coupon } from '@/lib/types';

import { createCoupon, updateCoupon, ActionResult } from './actions';

interface Props {
  initial?: Coupon;
}

export function CouponForm({ initial }: Props) {
  const router = useRouter();
  const t = useTranslations('admin.coupons.form');
  const tBtns = useTranslations('common.buttons');
  const isEdit = !!initial;

  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, fd: FormData): Promise<ActionResult> => {
      if (isEdit) {
        return await updateCoupon(initial!.id, _prev, fd);
      }
      return await createCoupon(_prev, fd);
    },
    {} as ActionResult,
  );

  const fieldErr = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label={t('fieldCode')} htmlFor="code" required error={fieldErr('code')}>
          <Input
            id="code"
            name="code"
            required
            defaultValue={initial?.code ?? ''}
            placeholder="DISKON50"
            className="uppercase font-mono font-bold"
          />
        </FormField>

        <FormField label={t('fieldType')} htmlFor="type" required error={fieldErr('type')}>
          <Select id="type" name="type" defaultValue={initial?.type ?? 'percent'}>
            <option value="percent">{t('typePercent')}</option>
            <option value="fixed">{t('typeFixed')}</option>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <FormField label={t('fieldValue')} htmlFor="value" required error={fieldErr('value')}>
          <Input
            id="value"
            name="value"
            type="number"
            step="0.01"
            required
            defaultValue={initial?.value ?? ''}
            placeholder="10 atau 50000"
          />
        </FormField>

        <FormField label={t('fieldMinOrder')} htmlFor="min_order" hint={t('fieldMinOrderHint')} error={fieldErr('min_order')}>
          <Input
            id="min_order"
            name="min_order"
            type="number"
            step="1000"
            defaultValue={initial?.min_order ?? ''}
            placeholder="0"
          />
        </FormField>

        <FormField label={t('fieldMaxUses')} htmlFor="max_uses" hint={t('fieldMaxUsesHint')} error={fieldErr('max_uses')}>
          <Input
            id="max_uses"
            name="max_uses"
            type="number"
            step="1"
            defaultValue={initial?.max_uses ?? ''}
            placeholder="Unlimited"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label={t('fieldValidFrom')} htmlFor="valid_from" error={fieldErr('valid_from')}>
          <Input
            id="valid_from"
            name="valid_from"
            type="datetime-local"
            defaultValue={initial?.valid_from ? initial.valid_from.substring(0, 16) : ''}
          />
        </FormField>

        <FormField label={t('fieldValidUntil')} htmlFor="valid_until" error={fieldErr('valid_until')}>
          <Input
            id="valid_until"
            name="valid_until"
            type="datetime-local"
            defaultValue={initial?.valid_until ? initial.valid_until.substring(0, 16) : ''}
          />
        </FormField>
      </div>

      <div className="pt-2">
        <Checkbox
          id="active"
          name="active"
          defaultChecked={initial ? initial.active : true}
          label={t('fieldActive')}
        />
      </div>

      {state.error && (
        <AlertBanner variant="error">
          {state.error}
        </AlertBanner>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? t('submitPending') : isEdit ? t('submitSave') : t('submitCreate')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="md"
          flat
          onClick={() => router.push('/admin/coupons')}
        >
          {tBtns('cancel')}
        </Button>
      </div>
    </form>
  );
}
