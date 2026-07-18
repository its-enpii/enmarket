'use client';

/**
 * ReactionStrip — minimal "Was this helpful?" reaction bar.
 *
 * Brief: "minimal, bordered box, e.g. 'Was this helpful?' with a couple of
 * chunky icon buttons".
 *
 * Behavior:
 *   - 2 chunky icon buttons (helpful / not really) + optional 1 share-like
 *     bookmark. Chunky = thick border, hard shadow, press-down mechanic.
 *   - State local only (no backend wiring) — counts + user choice persist
 *     di localStorage keyed by postSlug biar refresh tidak reset visual.
 *   - Toast feedback saat react — biar user tahu kliknya kepick.
 *
 * Tone: honest, low-stakes, no gamification. Reactions are private (per
 * device) — tidak ada leaderboard, tidak ada social proof number di UI
 * (cuma count yang user sendiri lihat).
 */

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/neobrutal';
import { toast } from '@/components/ui/toast-store';

type Reaction = 'helpful' | 'not-really' | null;

interface Props {
  postSlug: string;
}

const STORAGE_KEY_PREFIX = 'enpii-display-reaction:';

interface StoredReaction {
  choice: Reaction;
  helpful: number;
  notReally: number;
}

function loadStored(slug: string): StoredReaction {
  if (typeof window === 'undefined') {
    return { choice: null, helpful: 0, notReally: 0 };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + slug);
    if (!raw) return { choice: null, helpful: 0, notReally: 0 };
    const parsed = JSON.parse(raw) as Partial<StoredReaction>;
    return {
      choice: parsed.choice ?? null,
      helpful: parsed.helpful ?? 0,
      notReally: parsed.notReally ?? 0,
    };
  } catch {
    return { choice: null, helpful: 0, notReally: 0 };
  }
}

function saveStored(slug: string, data: StoredReaction) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY_PREFIX + slug, JSON.stringify(data));
  } catch {
    // ignore quota / private mode
  }
}

export function ReactionStrip({ postSlug }: Props) {
  const t = useTranslations('post.reactions');
  const [choice, setChoice] = useState<Reaction>(null);
  const [helpful, setHelpful] = useState(0);
  const [notReally, setNotReally] = useState(0);
  // mounted guard biar SSR/CSR tidak mismatch (count tidak di-render sampai hydrated)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = loadStored(postSlug);
    setChoice(stored.choice);
    setHelpful(stored.helpful);
    setNotReally(stored.notReally);
    setMounted(true);
  }, [postSlug]);

  function pick(next: Exclude<Reaction, null>) {
    // Toggle: kalau sudah pilih yang sama → un-pick. Kalau ganti → pindah.
    let newHelpful = helpful;
    let newNotReally = notReally;
    let newChoice: Reaction = next;

    if (choice === next) {
      // Un-pick — kurangi counter yang relevan
      newChoice = null;
      if (next === 'helpful') newHelpful = Math.max(0, newHelpful - 1);
      else newNotReally = Math.max(0, newNotReally - 1);
    } else {
      // Ganti / pertama kali
      if (choice === 'helpful') newHelpful = Math.max(0, newHelpful - 1);
      if (choice === 'not-really') newNotReally = Math.max(0, newNotReally - 1);
      if (next === 'helpful') newHelpful += 1;
      else newNotReally += 1;
    }

    setChoice(newChoice);
    setHelpful(newHelpful);
    setNotReally(newNotReally);
    saveStored(postSlug, { choice: newChoice, helpful: newHelpful, notReally: newNotReally });

    if (newChoice === 'helpful') {
      toast.success(t('thanks'));
    } else if (newChoice === 'not-really') {
      toast.info(t('improve'));
    }
  }

  return (
    <Card variant="surface" thick hoverable={false} className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Prompt */}
        <div className="flex-1">
          <p className="font-label text-label-sm uppercase tracking-[0.2em] text-accent mb-2">
            {t('eyebrow')}
          </p>
          <p className="font-display text-2xl md:text-3xl font-black uppercase leading-tight text-ink">
            {t('question')}
          </p>
          <p className="mt-2 font-body text-body-sm text-ink/70">
            {t('description')}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <ReactionButton
            label={t('helpful')}
            icon="✓"
            tone="accent"
            active={choice === 'helpful'}
            count={mounted ? helpful : 0}
            onClick={() => pick('helpful')}
          />
          <ReactionButton
            label={t('notReally')}
            icon="✕"
            tone="primary"
            active={choice === 'not-really'}
            count={mounted ? notReally : 0}
            onClick={() => pick('not-really')}
          />
        </div>
      </div>
    </Card>
  );
}

// ───── Internal subcomponent ─────

interface BtnProps {
  label: string;
  icon: string;
  tone: 'accent' | 'primary';
  active: boolean;
  count: number;
  onClick: () => void;
}

function ReactionButton({ label, icon, tone, active, count, onClick }: BtnProps) {
  // Tone mapping: accent bg = gold (positive), primary bg = purple (negative-ish)
  const baseCls =
    tone === 'accent'
      ? 'bg-accent text-ink border-ink'
      : 'bg-primary text-surface border-ink';
  const activeCls = active
    ? tone === 'accent'
      ? 'shadow-[1px_1px_0_0_var(--color-ink)] translate-x-[2px] translate-y-[2px]'
      : 'shadow-[1px_1px_0_0_var(--color-accent)] translate-x-[2px] translate-y-[2px]'
    : 'shadow-[4px_4px_0_0_var(--color-ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-ink)]';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'inline-flex items-center gap-2 border-2 px-4 py-3 font-label text-label-sm uppercase font-black tracking-wider transition-all cursor-pointer min-h-[48px]',
        baseCls,
        activeCls,
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center w-6 h-6 border-2 border-current font-bold text-base leading-none"
      >
        {icon}
      </span>
      <span>{label}</span>
      {count > 0 && (
        <Badge tone="ink" size="sm" shadow={false} className="min-w-[24px] !h-6 px-1.5 !text-xs font-bold normal-case tracking-normal">
          {count}
        </Badge>
      )}
    </button>
  );
}