'use client';

/**
 * MaintenanceForm — toggle site-wide maintenance mode.
 *
 * Backend: POST /api/admin/maintenance/toggle dengan { enabled, message }.
 * Menginvoke Laravel artisan down/up di backend.
 *
 * UX: form action pakai confirm dialog kalau ENABLE — ini impact besar
 * (customer tidak bisa checkout). Disable tidak perlu confirm.
 */

import { useActionState, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { Card } from '@/components/ui/neobrutal';
import { FormError } from '@/components/ui/FormMessage';
import { FormField } from '@/components/admin/FormField';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/toast-store';
import { confirmDialog } from '@/components/ui/dialog-store';
import type { MaintenanceStatus } from '@/lib/types';
import { EMPTY_ACTION_RESULT } from '@/lib/action-result';

import { setMaintenance, type SettingsActionResult } from './actions';
import { FormActions, FormSection } from '@/components/ui';

interface Props {
  status: MaintenanceStatus;
}

export function MaintenanceForm({ status }: Props) {
  const t = useTranslations('admin.settings.maintenance');
  const [state, action, pending] = useActionState<SettingsActionResult, FormData>(
    async (prev, fd) => {
      const res = await setMaintenance(prev, fd);
      if (res.ok && res.message) toast.success(res.message);
      return res;
    },
    EMPTY_ACTION_RESULT,
  );

  const enabled = status.enabled;

  // Controlled state supaya isian maintenance message tidak hilang
  // saat form action selesai (React 19 reset behavior).
  const [message, setMessage] = useState(status.message ?? '');

  /**
   * Form submit handler:
   * - Kalau mau ENABLE → confirm dulu (impact ke customer)
   * - Disable → langsung submit
   */
  async function handleSubmit(formData: FormData) {
    const targetEnabled = formData.get('enabled') === '1';
    if (targetEnabled && !enabled) {
      const ok = await confirmDialog({
        title: t('confirmTitle'),
        message: t('confirmMessage'),
        confirmLabel: t('confirmAction'),
        cancelLabel: t('confirmCancel'),
        danger: true,
      });
      if (!ok) return; // abort
    }
    await action(formData);
  }

  return (
    <Card variant="surface" className="p-6 space-y-5">
      <FormSection eyebrow={t('sectionStatus')} title={t('sectionStatusTitle')} />

      <form action={handleSubmit} className="space-y-4">
        <FormError variant="box">{state.error}</FormError>

        <div className="flex items-center gap-4 p-4 border-2 border-ink bg-surface">
          <div className="flex-1 min-w-0">
            <p className="font-display font-black uppercase text-lg text-ink">
              {enabled ? t('statusActive') : t('statusInactive')}
            </p>
            <p className="mt-1 font-body text-xs text-ink/60">
              {enabled ? t('statusActiveHint') : t('statusInactiveHint')}
            </p>
          </div>
          <span
            className={
              'inline-flex items-center gap-1 px-3 py-1.5 text-micro font-bold uppercase tracking-wider border-2 border-ink shrink-0 ' +
              (enabled ? 'bg-primary text-surface' : 'bg-surface text-ink')
            }
          >
            {enabled ? t('badgeActive') : t('badgeInactive')}
          </span>
        </div>

        <FormField
          label={t('fieldMessage')}
          htmlFor="maintenance-message"
          hint={t('fieldMessageHint')}
        >
          <Textarea
            id="maintenance-message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </FormField>

        <input type="hidden" name="enabled" value={enabled ? '0' : '1'} />

        <FormActions>
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending
              ? t('submitPending')
              : enabled
                ? t('submitInactive')
                : t('submitActive')}
          </Button>
        </FormActions>
      </form>
    </Card>
  );
}
