'use client';

import { useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { FormError } from '@/components/ui/FormMessage';
import { FormField } from '@/components/ui/FormField';
import { StatusPill } from '@/components/ui/StatusPill';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface Props {
  provisioningId: number;
  isRegenerate: boolean;
  initialCredentials: Record<string, string> | null;
  initialCatatan: string | null;
}

/**
 * Form input kredensial aktivasi. Dipakai baik untuk mark-ready pertama
 * maupun regenerate (ganti kredensial). Schema fleksibel: minimal
 * username + password, server/profile/expiry optional.
 *
 * Pakai native HTML5 <dialog> element untuk modal — simple, no external deps.
 */
export function MarkReadyForm({ provisioningId, isRegenerate, initialCredentials, initialCatatan }: Props) {
  const t = useTranslations('admin.accountProvisionings');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function openDialog() {
    setError(null);
    setSuccess(null);
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);

    const body: { credentials: Record<string, string | undefined>; catatan?: string } = {
      credentials: {
        username: (formData.get('username') as string) || undefined,
        password: (formData.get('password') as string) || undefined,
        server: (formData.get('server') as string) || undefined,
        profile: (formData.get('profile') as string) || undefined,
        expiry: (formData.get('expiry') as string) || undefined,
      },
      catatan: (formData.get('catatan') as string) || undefined,
    };

    startTransition(async () => {
      try {
        const { markReadyProvisioning, regenerateProvisioning } = await import('./actions');
        const res = isRegenerate
          ? await regenerateProvisioning(Number(formData.get('id')), body)
          : await markReadyProvisioning(Number(formData.get('id')), body);
        if (res.error) {
          setError(res.error);
          return;
        }
        setSuccess(res.message ?? t(isRegenerate ? 'regenerateSuccess' : 'markSuccess'));
        setTimeout(() => {
          closeDialog();
          window.location.reload();
        }, 1200);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    });
  }

  return (
    <>
      <Button
        variant={isRegenerate ? 'surface' : 'primary'}
        size="sm"
        onClick={openDialog}
        type="button"
      >
        {t(isRegenerate ? 'regenerate' : 'markReady')}
      </Button>

      <dialog
        ref={dialogRef}
        className="p-0 border-2 border-ink shadow-[6px_6px_0_0_var(--color-ink)] bg-surface max-w-lg w-full backdrop:bg-ink/30"
      >
        <div className="p-5">
          <h2 className="font-display text-xl font-black uppercase tracking-tight mb-1">
            {t(isRegenerate ? 'regenerateTitle' : 'markReadyTitle')}
          </h2>
          <p className="text-xs text-ink/70 mb-4">
            {t(isRegenerate ? 'regenerateDescription' : 'markReadyDescription')}
          </p>

          <form
            action={handleSubmit}
            className="space-y-3"
          >
            <input type="hidden" name="id" value={provisioningId} />

            <FormField label={t('fields.username')} htmlFor="provisioning-username" required>
              <Input
                id="provisioning-username"
                name="username"
                defaultValue={initialCredentials?.username ?? ''}
                required
                autoComplete="off"
              />
            </FormField>
            <FormField label={t('fields.password')} htmlFor="provisioning-password" required>
              <Input
                id="provisioning-password"
                name="password"
                type="text"
                defaultValue={initialCredentials?.password ?? ''}
                required
                autoComplete="off"
              />
            </FormField>
            <FormField label={t('fields.server')} htmlFor="provisioning-server">
              <Input
                id="provisioning-server"
                name="server"
                defaultValue={initialCredentials?.server ?? ''}
                autoComplete="off"
              />
            </FormField>
            <FormField label={t('fields.profile')} htmlFor="provisioning-profile">
              <Input
                id="provisioning-profile"
                name="profile"
                defaultValue={initialCredentials?.profile ?? ''}
                autoComplete="off"
              />
            </FormField>
            <FormField label={t('fields.expiry')} htmlFor="provisioning-expiry">
              <Input
                id="provisioning-expiry"
                name="expiry"
                defaultValue={initialCredentials?.expiry ?? ''}
                autoComplete="off"
              />
            </FormField>
            <FormField label={t('fields.catatan')} htmlFor="provisioning-catatan">
              <Textarea name="catatan" defaultValue={initialCatatan ?? ''} rows={2} />
            </FormField>

            {error && (
              <FormError variant="box">{error}</FormError>
            )}
            {success && (
              <StatusPill tone="success" className="text-xs">
                ✓ {success}
              </StatusPill>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="surface" size="sm" onClick={closeDialog}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isPending}>
                {t(isRegenerate ? 'regenerate' : 'markReady')} {isPending && '…'}
              </Button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
