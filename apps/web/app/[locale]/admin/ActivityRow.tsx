'use client';

import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/neobrutal';
import { formatDateTime } from '@/lib/format';
import type { ActivityLog } from '@/lib/types';

const ACTION_META: Record<string, { icon: string; key: string }> = {
  created: { icon: '+', key: 'created' },
  updated: { icon: '✎', key: 'updated' },
  status_changed: { icon: '⇄', key: 'status_changed' },
  deleted: { icon: '−', key: 'deleted' },
  maintenance_toggled: { icon: '⚠', key: 'maintenance_toggled' },
};

/**
 * Single row di Activity panel. Client component karena pakai
 * `useTranslations` untuk verb/subject lookup.
 */
export function ActivityRow({ entry }: { entry: ActivityLog }) {
  const t = useTranslations('admin.dashboard');
  const meta = ACTION_META[entry.action] ?? { icon: '•', key: entry.action };
  const verb = safeT(t, `activityVerb.${meta.key}`, entry.action);
  const subject = safeT(t, `activitySubject.${entry.subject_type}`, entry.subject_type);
  const detail = entry.subject_label ?? entry.subject_id ?? '';

  return (
    <li>
      <Card
        variant="surface"
        hoverable={false}
        className="flex items-start gap-3 p-3 hover:bg-accent transition-colors"
      >
        <span
          aria-hidden="true"
          className="shrink-0 w-8 h-8 flex items-center justify-center border-2 border-ink bg-primary text-surface font-display font-black text-base"
        >
          {meta.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm text-ink">
            <span className="font-bold">{verb}</span>{' '}
            <span className="text-ink/60 uppercase font-bold tracking-wide text-[10px]">
              {subject}
            </span>
            {detail && (
              <>
                {' '}
                <span className="font-bold truncate">"{detail}"</span>
              </>
            )}
          </p>
          <p className="mt-1 text-[10px] text-ink/50 italic">
            {formatDateTime(entry.created_at)}
          </p>
        </div>
      </Card>
    </li>
  );
}

function safeT(t: ReturnType<typeof useTranslations>, key: string, fallback: string): string {
  try {
    return t(key);
  } catch {
    return fallback;
  }
}