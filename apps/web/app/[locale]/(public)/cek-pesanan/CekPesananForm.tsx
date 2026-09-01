'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { FormError, FormHint } from '@/components/ui/FormMessage';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';

import { checkOrderAction } from './actions';

interface State {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

interface Props {
  defaultKode?: string;
}

export function CekPesananForm({ defaultKode = '' }: Props) {
  const t = useTranslations('checkOrder');
  const [state, formAction, pending] = useActionState(
    async (_prev: State | undefined, formData: FormData): Promise<State> => {
      return checkOrderAction({
        kode_order: ((formData.get('kode_order') as string) ?? '').trim().toUpperCase(),
        email: ((formData.get('email') as string) ?? '').trim(),
      });
    },
    {} as State,
  );

  return (
    <form action={formAction} className="space-y-4">
      <FormField label={t('codeLabel')} htmlFor="kode_order" error={state?.fieldErrors?.kode_order?.[0]}>
        <Input
          id="kode_order"
          name="kode_order"
          type="text"
          required
          defaultValue={defaultKode}
          placeholder={t('placeholder')}
          autoComplete="off"
          className="font-mono"
        />
      </FormField>

      <FormField label={t('emailLabel')} htmlFor="email" required hint={t('emailHint')} error={state?.fieldErrors?.email?.[0]}>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder={t('emailPlaceholder')}
          autoComplete="email"
        />
      </FormField>

      {state?.error && !state.fieldErrors && (
        <FormError variant="box">{state.error}</FormError>
      )}

      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={pending}
        className="w-full"
      >
        {pending ? `${t('submit')}…` : `${t('submit')} →`}
      </Button>
    </form>
  );
}
