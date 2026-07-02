'use client';

/**
 * Client form untuk input token. Pakai useActionState agar error dari
 * server action muncul otomatis.
 */

import { useActionState } from 'react';

interface State {
  error?: string;
}

interface Props {
  action: (formData: FormData) => Promise<State>;
}

export function LoginForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(
    async (_prev: State | undefined, formData: FormData): Promise<State> => {
      return action(formData);
    },
    {} as State,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="token"
          className="block text-sm font-bold mb-1.5 text-ink uppercase tracking-wide"
        >
          Admin Token
        </label>
        <input
          id="token"
          name="token"
          type="password"
          required
          autoComplete="off"
          autoFocus
          placeholder="dev-admin-token-…"
          className="w-full bg-surface border-2 border-ink px-3 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all"
        />
      </div>

      {state?.error && (
        <div className="bg-accent border-2 border-ink px-3 py-2 text-sm font-medium text-ink shadow-[2px_2px_0_0_var(--color-ink)]">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-surface border-2 border-ink px-5 py-3 font-bold shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--color-ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_var(--color-ink)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Memeriksa…' : 'Masuk →'}
      </button>
    </form>
  );
}