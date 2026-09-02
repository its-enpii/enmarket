'use client';

import { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

import { ModalShell } from '@/components/ui/ModalShell';
import { Button, Card } from '@/components/ui/neobrutal';
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
 * Modal dirender melalui portal dan ModalShell.
 */
export function MarkReadyForm({ provisioningId, isRegenerate, initialCredentials, initialCatatan }: Props) {
  const t = useTranslations('admin.accountProvisionings');
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  function openDialog() {
    setError(null);
    setSuccess(null);
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
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

      {mounted && createPortal(
        <ModalShell open={open} onClose={closeDialog}>
          <Card
            variant="surface"
            thick
            elevation={8}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto z-raised animate-scale-in p-5"
          >
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
          </Card>
        </ModalShell>,
        document.body,
      )}
    </>
  );
}
