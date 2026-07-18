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

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { Card } from '@/components/ui/neobrutal';
import { FormError } from '@/components/ui/FormMessage';
import { FormField } from '@/components/admin/FormField';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/toast-store';
import { confirmDialog } from '@/components/ui/dialog-store';
import type { MaintenanceStatus } from '@/lib/types';

import { setMaintenance, type ActionResult } from './actions';

const INITIAL: ActionResult = {};

interface Props {
  status: MaintenanceStatus;
}

export function MaintenanceForm({ status }: Props) {
  const t = useTranslations('admin.settings.maintenance');
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    async (prev, fd) => {
      const res = await setMaintenance(prev, fd);
      if (res.ok && res.message) toast.success(res.message);
      return res;
    },
    INITIAL,
  );

  const enabled = status.enabled;

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
      <div className="border-b-2 border-ink pb-3">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
          ✎ {t('sectionStatus')}
        </p>
        <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">
          {t('sectionStatusTitle')}
        </h2>
      </div>

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
              'inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-2 border-ink shrink-0 ' +
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
            defaultValue={status.message ?? ''}
            rows={3}
            maxLength={500}
          />
        </FormField>

        <input type="hidden" name="enabled" value={enabled ? '0' : '1'} />

        <div className="flex gap-2 pt-2 border-t-2 border-ink">
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending
              ? t('submitPending')
              : enabled
                ? t('submitInactive')
                : t('submitActive')}
          </Button>
        </div>
      </form>
    </Card>
  );
}