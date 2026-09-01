/**
 * TrustNote — info box catatan studio di summary aside.
 *
 * Specifik keranjang (tidak muncul di tempat lain — copy berbeda dari
 * TrustSection homepage). Pakai Card primitive surface.
 */

import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/neobrutal';
import { Eyebrow } from '@/components/ui/neobrutal';

export async function TrustNote() {
  const t = await getTranslations('keranjang');
  return (
    <Card variant="surface" hoverable={false} className="p-5">
      <Eyebrow size="micro" color="accent" className="mb-2">
        {t('trustNoteEyebrow')}
      </Eyebrow>
      <p className="font-display text-base font-black uppercase leading-tight text-ink">
        {t('trustNoteTitle')}
      </p>
      <p className="mt-2 font-body text-xs text-ink/70 leading-snug">
        {t('trustNoteBody')}
      </p>
    </Card>
  );
}
