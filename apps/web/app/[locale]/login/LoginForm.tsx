'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { FormError } from '@/components/ui/FormMessage';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui';
import { Button } from '@/components/ui/neobrutal';

interface State {
  error?: string;
}

interface Props {
  action: (formData: FormData) => Promise<State | void>;
}

export function LoginForm({ action }: Props) {
  const t = useTranslations('login');
  const [state, formAction, pending] = useActionState<State | undefined, FormData>(
    async (_prev, formData) => {
      const result = await action(formData);
      return result ?? {};
    },
    undefined,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <FormField label={t('tokenLabel')} htmlFor="token">
        <Input
          id="token"
          name="token"
          type="password"
          required
          autoComplete="off"
          autoFocus
          placeholder={t('tokenPlaceholder')}
        />
      </FormField>

      {state?.error && (
        <FormError variant="box">{state.error}</FormError>
      )}

      <Button
        variant="primary"
        size="md"
        type="submit"
        disabled={pending}
        className="w-full"
      >
        {pending ? `${t('submit')}…` : (
          <span className="inline-flex items-center gap-2">
            {t('submit')}
            <Icon name="arrow-right" />
          </span>
        )}
      </Button>
    </form>
  );
}
