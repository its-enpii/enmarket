'use client';

import { useEffect, useState, type RefObject } from 'react';
import { useTranslations } from 'next-intl';

import { Button, Card } from '@/components/ui/neobrutal';
import { Icon } from '@/components/ui';
import { sponsorBidApi, type SponsorLeaderboardEntry } from '@/lib/sponsor-api';
import { formatRupiah } from '@/lib/format';

import type { SponsorBidFormHandle } from './SponsorBidForm';

export function SponsorLeaderboard({
  bidFormRef,
}: {
  bidFormRef: RefObject<SponsorBidFormHandle | null>;
}) {
  const t = useTranslations('sponsor');
  const [entries, setEntries] = useState<SponsorLeaderboardEntry[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    sponsorBidApi
      .fetchLeaderboard()
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch(() => {
        if (!cancelled) setError(t('leaderboard.error'));
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  if (error) {
    return (
      <Card variant="surface" thick hoverable={false} className="p-5">
        <p className="font-body text-sm font-medium text-ink/70">{error}</p>
      </Card>
    );
  }

  if (entries === null) {
    return (
      <Card variant="surface" thick hoverable={false} className="p-5">
        <p className="font-body text-sm font-medium text-ink/60">{t('leaderboard.loading')}</p>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card variant="filled-accent" thick hoverable={false} className="p-5">
        <p className="font-display text-lg font-black uppercase">{t('leaderboard.empty')}</p>
        <p className="mt-1 font-body text-sm text-ink/70">{t('leaderboard.emptyBody')}</p>
      </Card>
    );
  }

  return (
    <ol className="grid gap-3">
      {entries.map((entry) => (
        <li key={`${entry.domain}-${entry.rank}`}>
          <Card
            variant={entry.rank === 1 ? 'filled-accent' : 'surface'}
            thick
            hoverable={false}
            className="grid gap-3 p-4"
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex size-10 shrink-0 items-center justify-center border-2 border-ink font-display text-lg font-black ${
                  entry.rank <= 3 ? 'bg-accent text-ink' : 'bg-surface text-primary'
                }`}
              >
                {entry.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display text-base font-black uppercase text-primary">
                    {entry.name}
                  </p>
                  {entry.rank === 1 && <Icon name="crown" size={18} className="text-ink" />}
                </div>
                <p className="truncate font-mono text-xs text-ink/60">{entry.domain}</p>
                <p className="font-mono text-sm font-bold text-ink">
                  {formatRupiah(entry.bid_amount)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant={entry.rank === 1 ? 'primary' : 'surface'}
              onClick={() => bidFormRef.current?.challenge(entry.bid_amount)}
              className="justify-self-end"
            >
              {t('leaderboard.challenge')}
            </Button>
          </Card>
        </li>
      ))}
    </ol>
  );
}
