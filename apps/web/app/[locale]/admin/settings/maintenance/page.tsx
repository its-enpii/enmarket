/**
 * Settings — Maintenance.
 *
 * Server component: fetch /api/admin/maintenance/status → render
 * MaintenanceForm client component. Submit via Server Action toggle on/off
 * + edit banner message.
 */

import { Card } from '@/components/ui/neobrutal';
import { apiGet } from '@/lib/api';
import type { MaintenanceStatus } from '@/lib/types';

import { MaintenanceForm } from '../MaintenanceForm';

export const metadata = {
  title: 'Maintenance — Admin',
};

export default async function MaintenanceSettingsPage() {
  let status: MaintenanceStatus | null = null;
  try {
    const res = await apiGet<{ data: MaintenanceStatus }>(
      '/api/admin/maintenance/status',
    );
    status = res.data;
  } catch {
    // Backend down
  }

  return (
    <div className="space-y-6">
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-3">
          ✎ Settings / Maintenance
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
          Maintenance<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          Mode toko. Aktifkan saat deploy besar, maintenance database, atau
          hal penting lain yang mengharuskan toko offline sementara.
        </p>
      </header>

      {status ? (
        <MaintenanceForm status={status} />
      ) : (
        <Card variant="surface" className="p-6 text-ink/60">
          <p className="font-display text-lg font-black uppercase">
            ⚠ Backend belum merespon
          </p>
          <p className="mt-2 font-body text-sm">
            Maintenance endpoint tidak bisa diakses.
          </p>
        </Card>
      )}
    </div>
  );
}
