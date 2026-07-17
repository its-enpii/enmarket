'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { FormError } from '@/components/ui/FormMessage';
import { Input } from '@/components/ui/Input';
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
      <div>
        <label
          htmlFor="token"
          className="block text-xs font-bold uppercase tracking-wide text-ink mb-1.5"
        >
          {t('tokenLabel')}
        </label>
        <Input
          id="token"
          name="token"
          type="password"
          required
          autoComplete="off"
          autoFocus
          placeholder={t('tokenPlaceholder')}
        />
      </div>

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
        {pending ? `${t('submit')}…` : `${t('submit')} →`}
      </Button>
    </form>
  );
}