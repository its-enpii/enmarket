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

import { Button } from '@/components/admin/Button';
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
        title: 'Aktifkan Maintenance?',
        message: 'Pelanggan tidak akan bisa akses toko. Order baru akan ditolak sampai mode ini dimatikan. Yakin?',
        confirmLabel: 'Ya, Aktifkan',
        cancelLabel: 'Batal',
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
          ✎ Status
        </p>
        <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">
          Mode Toko
        </h2>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <FormError variant="box">{state.error}</FormError>

        <div className="flex items-center gap-4 p-4 border-2 border-ink bg-surface">
          <div className="flex-1 min-w-0">
            <p className="font-display font-black uppercase text-lg text-ink">
              {enabled ? '● Maintenance Aktif' : '○ Toko Normal'}
            </p>
            <p className="mt-1 font-body text-xs text-ink/60">
              {enabled
                ? 'Pengunjung melihat halaman 503. Hanya admin yang bisa bypass.'
                : 'Toko berjalan normal. Pelanggan bisa checkout seperti biasa.'}
            </p>
          </div>
          <span
            className={
              'inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-2 border-ink shrink-0 ' +
              (enabled ? 'bg-primary text-surface' : 'bg-surface text-ink')
            }
          >
            {enabled ? 'ACTIVE' : 'OFF'}
          </span>
        </div>

        <FormField
          label="Banner Message"
          htmlFor="maintenance-message"
          hint="Teks yang ditampilkan ke pelanggan saat maintenance."
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
              ? 'Memproses…'
              : enabled
                ? 'Matikan Maintenance'
                : 'Aktifkan Maintenance'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
