/**
 * Settings — Site Identity.
 *
 * Server component: fetch settings via apiGet → pass data ke IdentityForm client
 * component. Submit di-handle via Server Action (./actions.ts) yang call
 * PATCH /api/admin/settings group=identity|social|footer.
 */

import { Card } from '@/components/ui/neobrutal';
import { apiGet } from '@/lib/api';
import type { SiteSettings } from '@/lib/types';

import { IdentityForm } from './IdentityForm';

export const metadata = {
  title: 'Site Identity — Admin',
};

export default async function SiteIdentitySettingsPage() {
  let initialData: SiteSettings | null = null;
  try {
    const res = await apiGet<{ data: SiteSettings }>('/api/admin/settings');
    initialData = res.data;
  } catch {
    // Backend down / token expired → render empty form. IdentityForm handles
    // null values via ?? fallback.
  }

  return (
    <div className="space-y-6">
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-label-sm uppercase tracking-[0.3em] text-accent mb-3">
          ✎ Settings / Site Identity
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
          Identitas Studio<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          Nama, tagline, logo, dan social link. Yang muncul di footer toko
          dan halaman public.
        </p>
      </header>

      {initialData ? (
        <IdentityForm
          identity={initialData.identity}
          social={initialData.social}
          footer={initialData.footer}
        />
      ) : (
        <Card variant="surface" className="p-6 text-ink/60">
          <p className="font-display text-lg font-black uppercase">
            ⚠ Backend belum merespon
          </p>
          <p className="mt-2 font-body text-sm">
            Settings endpoint tidak bisa diakses. Cek token admin atau status API server.
          </p>
        </Card>
      )}
    </div>
  );
}
