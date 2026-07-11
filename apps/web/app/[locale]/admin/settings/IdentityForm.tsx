'use client';

/**
 * IdentityForm — combined client form untuk Site Identity + Social + Footer.
 * Dipakai oleh /admin/settings page (server component → IdentityForm).
 *
 * 3 form terpisah (identity / social / footer) dengan action server masing-masing
 * supaya submit granular — gak harus submit ulang seluruh halaman kalau
 * cuma edit tagline.
 */

import { useActionState, useState, useTransition } from 'react';

import { Button } from '@/components/admin/Button';
import { FileUpload } from '@/components/admin/FileUpload';
import { Card } from '@/components/ui/neobrutal';
import { FormError } from '@/components/ui/FormMessage';
import { FormField } from '@/components/admin/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/toast-store';
import type {
  SiteFooter,
  SiteIdentity,
  SiteSocial,
  SocialLink,
} from '@/lib/types';

import {
  updateFooter,
  updateIdentity,
  updateSocial,
  uploadLogo,
  type ActionResult,
} from './actions';

const INITIAL: ActionResult = {};

interface Props {
  identity: SiteIdentity;
  social: SiteSocial;
  footer: SiteFooter;
}

// ───── Identity section ─────

function IdentitySection({ initial }: { initial: SiteIdentity }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    async (prev, fd) => {
      const res = await updateIdentity(prev, fd);
      if (res.ok && res.message) toast.success(res.message);
      return res;
    },
    INITIAL,
  );

  // Lift logo URL state ke sini supaya hidden input identity form + LogoUploader
  // bisa sync via single source of truth (controlled).
  const [logoUrl, setLogoUrl] = useState<string | null>(initial.logo_url);

  return (
    <Card variant="surface" className="p-6 space-y-5">
      <div className="border-b-2 border-ink pb-3">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
          ✎ Studio
        </p>
        <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">
          Identitas
        </h2>
      </div>

      <form action={action} className="space-y-4">
        <FormError variant="box">{state.error}</FormError>

        <FormField label="Nama Studio" htmlFor="studio-name" required>
          <Input
            id="studio-name"
            name="studio_name"
            type="text"
            defaultValue={initial.studio_name ?? 'enpiistudio'}
            placeholder="enpiistudio"
          />
        </FormField>

        <FormField
          label="Tagline"
          htmlFor="tagline"
          hint="Muncul di header toko dan meta description. Maksimal 80 karakter."
        >
          <Input
            id="tagline"
            name="tagline"
            type="text"
            defaultValue={initial.tagline ?? ''}
            placeholder="Discover, develop, display."
            maxLength={80}
          />
        </FormField>

        <FormField
          label="Logo Studio"
          htmlFor="logo-upload"
          hint="Format: PNG, SVG, JPEG, WebP. Maks 2MB. Disimpan ke EnStorage, URL otomatis terisi."
        >
          <LogoUploader value={logoUrl} onChange={setLogoUrl} />
          <input
            type="hidden"
            name="logo_url"
            value={logoUrl ?? ''}
          />
        </FormField>

        <div className="flex gap-2 pt-2 border-t-2 border-ink">
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? 'Menyimpan…' : 'Simpan Identitas'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ───── Social section (truly dynamic) ─────
//
// TIDAK ADA dropdown, TIDAK ADA predetermined platform. User bebas ngetik
// label (mis. "Instagram", "Twitter", "Are.na", "Custom") + URL per row.
// Tambah/hapus row via button — itu definisi dinamis.

function emptyLink(): SocialLink {
  return { label: '', url: '' };
}

function SocialSection({ initial }: { initial: SiteSocial }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    async (prev, fd) => {
      const res = await updateSocial(prev, fd);
      if (res.ok && res.message) toast.success(res.message);
      return res;
    },
    INITIAL,
  );

  const [links, setLinks] = useState<SocialLink[]>(
    initial.length > 0 ? initial : [emptyLink()],
  );

  function addLink() {
    setLinks((prev) => [...prev, emptyLink()]);
  }

  function removeLink(idx: number) {
    setLinks((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateLink(idx: number, patch: Partial<SocialLink>) {
    setLinks((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  return (
    <Card variant="surface" className="p-6 space-y-5">
      <div className="border-b-2 border-ink pb-3">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
          ✎ Social
        </p>
        <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">
          Social Links
        </h2>
      </div>

      <form action={action} className="space-y-4">
        <FormError variant="box">{state.error}</FormError>

        <input
          type="hidden"
          name="social_links"
          value={JSON.stringify(
            links.map(({ label, url }) => ({ label, url })),
          )}
        />

        <div className="space-y-3">
          {links.map((link, idx) => (
            <Card key={idx} variant="surface" className="p-3">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2">
                <Input
                  type="text"
                  value={link.label}
                  placeholder="Label (mis. Instagram)"
                  onChange={(e) => updateLink(idx, { label: e.target.value })}
                  aria-label="Label platform"
                />
                <Input
                  type="url"
                  value={link.url}
                  placeholder="https://..."
                  onChange={(e) => updateLink(idx, { url: e.target.value })}
                  aria-label="URL"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  flat
                  onClick={() => removeLink(idx)}
                  className="shrink-0"
                  disabled={links.length === 1}
                  aria-label="Hapus link"
                >
                  ✕
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Button type="button" variant="surface" size="sm" onClick={addLink}>
          + Tambah Link
        </Button>

        <div className="flex gap-2 pt-2 border-t-2 border-ink">
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? 'Menyimpan…' : 'Simpan Social Links'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ───── Footer section ─────

function FooterSection({ initial }: { initial: SiteFooter }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    async (prev, fd) => {
      const res = await updateFooter(prev, fd);
      if (res.ok && res.message) toast.success(res.message);
      return res;
    },
    INITIAL,
  );

  return (
    <Card variant="surface" className="p-6 space-y-5">
      <div className="border-b-2 border-ink pb-3">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent">
          ✎ Footer
        </p>
        <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">
          Footer Text
        </h2>
      </div>

      <form action={action} className="space-y-4">
        <FormError variant="box">{state.error}</FormError>

        <FormField
          label="Teks Footer"
          htmlFor="footer-text"
          hint="Muncul di bawah footer toko. Bisa multi-line."
        >
          <Textarea
            id="footer-text"
            name="footer_text"
            defaultValue={initial.text ?? ''}
            rows={3}
          />
        </FormField>

        <div className="flex gap-2 pt-2 border-t-2 border-ink">
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? 'Menyimpan…' : 'Simpan Footer'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ───── Composite ─────

export function IdentityForm({ identity, social, footer }: Props) {
  return (
    <div className="space-y-6">
      <IdentitySection initial={identity} />
      <SocialSection initial={social} />
      <FooterSection initial={footer} />
    </div>
  );
}

// ───── Logo uploader ─────
//
// Sub-component: render <FileUpload> + preview + tombol Hapus. Saat file
// dipilih → trigger Server Action uploadLogo (multipart) → EnStorage. URL
// hasil di-emit ke parent via onChange. Hidden input `logo_url` di parent
// controlled via prop `value` — single source of truth.

function LogoUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleUpload(files: File[]) {
    const file = files[0];
    if (!file) return;

    setError(null);
    const fd = new FormData();
    fd.append('file', file);

    startTransition(async () => {
      const res = await uploadLogo(fd);
      if (res.ok && res.url) {
        onChange(res.url);
        if (res.message) toast.success(res.message);
      } else {
        setError(res.error ?? 'Gagal upload logo.');
        toast.error(res.error ?? 'Gagal upload logo.');
      }
    });
  }

  function handleRemove() {
    onChange(null);
  }

  return (
    <div className="space-y-3">
      {value && (
        <Card variant="surface" className="p-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Logo studio"
            className="h-16 w-16 object-contain border-2 border-ink bg-surface"
          />
          <div className="flex-1 min-w-0">
            <p className="font-display font-black uppercase text-xs text-ink">
              ● Logo Aktif
            </p>
            <p className="mt-1 text-[10px] text-ink/60 font-mono truncate">{value}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            flat
            onClick={handleRemove}
          >
            Hapus
          </Button>
        </Card>
      )}

      <FileUpload
        name="logo_file"
        accept="image/png,image/svg+xml,image/jpeg,image/webp"
        maxSizeMB={2}
        onChange={handleUpload}
        defaultPreview={undefined}
      />

      {pending && (
        <p className="font-body text-xs text-primary italic">
          ⏳ Mengupload…
        </p>
      )}
      {error && (
        <p className="font-body text-xs text-primary font-bold">{error}</p>
      )}
    </div>
  );
}
