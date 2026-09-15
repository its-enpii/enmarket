/**
 * CalloutBlock — kotak catatan editorial: info / tip / warning.
 *
 * Struktur: border ink 4px + hard shadow, stripe warna 8px di kiri (elemen
 * sendiri, bukan border-l — supaya tidak bentrok dengan shorthand border-4),
 * eyebrow label mono kecil + teks whitespace-preserving.
 */

import { Eyebrow } from '@/components/ui/neobrutal';
import { Icon, type IconName } from '@/components/ui';

import type { CalloutBlockData, CalloutTone } from '@/lib/post-blocks';

interface Props {
  block: CalloutBlockData;
  /** Label i18n per tone -- dipakai sebagai eyebrow label. */
  toneLabels: Record<CalloutTone, string>;
}

interface ToneStyles {
  box: string;
  stripe: string;
  label: string;
  icon: IconName;
}

const TONE_CLS: Record<CalloutTone, ToneStyles> = {
  info: {
    box: 'bg-surface',
    stripe: 'bg-primary',
    label: 'text-primary',
    icon: 'info',
  },
  tip: {
    box: 'bg-accent/20',
    stripe: 'bg-accent',
    label: 'text-ink',
    icon: 'tip',
  },
  warning: {
    box: 'bg-danger/10',
    stripe: 'bg-danger',
    label: 'text-danger',
    icon: 'warning',
  },
};

const TONES: readonly CalloutTone[] = ['info', 'tip', 'warning'];

export function CalloutBlock({ block, toneLabels }: Props) {
  const tone: CalloutTone = TONES.includes(block.data.tone as CalloutTone)
    ? (block.data.tone as CalloutTone)
    : 'info';
  const styles = TONE_CLS[tone];

  return (
    <aside className={`flex border-4 border-ink shadow-brutal-4 ${styles.box}`}>
      <span
        aria-hidden="true"
        className={`w-2 shrink-0 ${styles.stripe}`}
      />
      <div className="grow p-5">
        <Eyebrow size="label-sm" className="mb-2 flex items-center gap-2">
          <Icon name={styles.icon} size={16} className={styles.label} />
          <span className={styles.label}>{toneLabels[tone]}</span>
        </Eyebrow>
        <p className="whitespace-pre-line font-body text-base leading-relaxed text-ink">
          {block.data.text}
        </p>
      </div>
    </aside>
  );
}
