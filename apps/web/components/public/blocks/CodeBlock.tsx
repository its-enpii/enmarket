'use client';

/**
 * CodeBlock — blok kode bergaya terminal neobrutal.
 *
 * Header: tiga "dot" terminal, badge bahasa (atau filename kalau ada), tombol
 * Salin dengan feedback "Tersalin!". Body: pre/code dengan nomor baris,
 * horizontal scroll, tanpa syntax highlighter (dependency baru tidak perlu —
 * token warna flat palette sudah cukup untuk look-nya).
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/neobrutal';
import { Icon } from '@/components/ui';

import type { CodeBlockData } from '@/lib/post-blocks';

interface Props {
  block: CodeBlockData;
}

type CopyState = 'idle' | 'copied' | 'failed';

export function CodeBlock({ block }: Props) {
  const { code, language, filename } = block.data;
  const t = useTranslations('postBlocks');
  const [copied, setCopied] = useState<CopyState>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const lines = code.replace(/\r\n?/g, '\n').split('\n');
  const label = filename?.trim() || language?.trim() || '';

  async function copy() {
    let ok = true;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      ok = legacyCopy(code);
    }
    setCopied(ok ? 'copied' : 'failed');
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied('idle'), 2000);
  }

  return (
    <figure className="border-4 border-ink bg-ink text-surface shadow-brutal-4">
      <figcaption className="flex flex-wrap items-center gap-3 border-b-4 border-ink bg-surface px-3 py-2">
        <span aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
          <span className="h-3 w-3 border-2 border-ink bg-danger" />
          <span className="h-3 w-3 border-2 border-ink bg-warning" />
          <span className="h-3 w-3 border-2 border-ink bg-accent" />
        </span>

        {label ? (
          <Badge tone="ink" size="sm" thin className="font-label uppercase tracking-wider">
            {label}
          </Badge>
        ) : null}

        <Button
          type="button"
          variant={copied === 'copied' ? 'accent' : 'surface'}
          size="sm"
          flat
          onClick={copy}
          className="ml-auto inline-flex items-center gap-1.5 border-2 border-ink text-label-sm uppercase tracking-wider shadow-brutal-2 hover:bg-accent"
        >
          {copied === 'copied' ? (
            <>
              <Icon name="check" size={14} />
              {t('copied')}
            </>
          ) : copied === 'failed' ? (
            t('copyFailed')
          ) : (
            <>
              <Icon name="copy" size={14} />
              {t('copyCode')}
            </>
          )}
        </Button>
      </figcaption>

      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
        <code className="block">
          {lines.map((line, index) => (
            <span key={index} className="table w-full">
              <span
                aria-hidden="true"
                className="table-cell select-none pr-4 text-right align-top text-surface/40"
              >
                {index + 1}
              </span>
              {/* Spasi tunggal menjaga tinggi baris untuk baris kosong. */}
              <span className="table-cell whitespace-pre align-top">{line === '' ? ' ' : line}</span>
            </span>
          ))}
        </code>
      </pre>

      {filename && language ? (
        <figcaption className="border-t-2 border-ink px-4 py-1.5 font-label text-micro uppercase tracking-label text-surface/60">
          {language}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Fallback untuk browser/iframe tanpa Clipboard API (non-secure context). */
function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.className = 'absolute -left-[9999px] top-0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}
