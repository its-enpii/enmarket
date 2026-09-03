import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/Badge';
import { Text } from '@/components/ui';
import type { AccountProvisioningInfo } from '@/lib/types';

interface Props {
  provisioning: AccountProvisioningInfo;
}

/**
 * Box untuk menampilkan status aktivasi akun (produk bertipe `account_manual`).
 *
 * Tiga state:
 * - menunggu_admin : placeholder dengan hint "sedang diproses"
 * - siap           : tampilkan kredensial per-field (username/password/server/...)
 * - gagal / dibatalkan : tampilkan badge status + hint
 */
export function AccountProvisioningBox({ provisioning }: Props) {
  const t = useTranslations('accountProvisioning');

  if (provisioning.status === 'menunggu_admin') {
    return (
      <div className="mt-2 border-2 border-dashed border-ink/40 bg-ink/5 p-3">
        <div className="flex items-center gap-2">
          <Badge tone="primary" size="sm" shadow={false}>
            ⏳ {t('statusPending')}
          </Badge>
        </div>
        <Text variant="hint">{t('pending')}</Text>
      </div>
    );
  }

  if (provisioning.status === 'siap' && provisioning.credentials) {
    const creds = provisioning.credentials;
    const fields: Array<{ key: keyof typeof creds; label: string; sensitive?: boolean }> = [
      { key: 'username', label: t('username') },
      { key: 'password', label: t('password'), sensitive: true },
      { key: 'server', label: t('server') },
      { key: 'profile', label: t('profile') },
      { key: 'expiry', label: t('expiry') },
    ];
    const present = fields.filter((f) => creds[f.key]);

    return (
      <div className="mt-2 bg-ink text-surface border-2 border-ink p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-micro font-bold uppercase tracking-wider opacity-70">
            ✓ {t('statusReady')}
          </p>
        </div>
        <div className="space-y-1.5">
          {present.map((f) => (
            <div key={f.key} className="flex items-baseline gap-2 text-xs">
              <span className="font-bold uppercase tracking-wider opacity-60 shrink-0 w-16">
                {f.label}
              </span>
              <span className="font-mono font-bold break-all select-all">{creds[f.key]}</span>
            </div>
          ))}
        </div>
        {provisioning.catatan && (
          <p className="mt-2 pt-2 border-t border-surface/20 text-micro italic opacity-70">
            📝 {provisioning.catatan}
          </p>
        )}
      </div>
    );
  }

  // gagal / dibatalkan
  const tone = provisioning.status === 'gagal' ? 'primary' : 'primary';
  return (
    <div className="mt-2 border-2 border-ink/20 bg-ink/5 p-2.5">
      <Badge tone={tone} size="sm" shadow={false}>
        {t(`status${provisioning.status.charAt(0).toUpperCase() + provisioning.status.slice(1)}` as 'statusGagal' | 'statusDibatalkan')}
      </Badge>
      <Text as="p" variant="muted" className="mt-1 italic">{t('noDelivery')}</Text>
    </div>
  );
}
