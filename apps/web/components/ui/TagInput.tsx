'use client';

/**
 * TagInput — kontrol multi-tag untuk form admin (post `category` + produk).
 *
 * Nilai dikirim sebagai `tags[]` (array multipart), BUKAN JSON string — jadi
 * setiap tag dirender sebagai satu `<input type="hidden" name={`${name}[]`}>`.
 * Server menormalisasi (trim + lowercase + dedupe); komponen ini menyimpan
 * apa adanya dari input, hanya merapikan spasi agar UI tetap enak dibaca.
 *
 * Normalisasi hanya menyiapkan nilai untuk tampilan field; tidak mengubah
 * nilai tag yang sudah ditambahkan.
 */

import { useState, type KeyboardEvent } from 'react';

import { Badge } from './Badge';
import { Input } from './Input';
import { Button } from './neobrutal';

interface Props {
  name?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  maxLength?: number;
  placeholder?: string;
  addLabel?: string;
  removeLabel?: (tag: string) => string;
  disabled?: boolean;
  id?: string;
}

export function TagInput({
  name = 'tags',
  value,
  onChange,
  maxTags = 10,
  maxLength = 40,
  placeholder,
  addLabel,
  removeLabel,
  disabled = false,
  id,
}: Props) {
  const [draft, setDraft] = useState('');

  const full = value.length >= maxTags;

  function add() {
    const normalized = draft.trim().replace(/\s+/g, ' ');
    if (!normalized) return;
    if (full) return;
    const tooLong = normalized.length > maxLength;
    if (tooLong) return;
    const exists = value.some((tag) => tag.toLowerCase() === normalized.toLowerCase());
    if (exists) {
      setDraft('');
      return;
    }
    onChange([...value, normalized]);
    setDraft('');
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    }
  }

  return (
    <div className="space-y-2">
      {value.map((tag, i) => (
        <input key={`hidden-${i}`} type="hidden" name={`${name}[]`} value={tag} />
      ))}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, i) => (
            <Badge key={`${tag}-${i}`} tone="ink" size="md" className="gap-2">
              <span className="truncate max-w-[16rem]">{tag}</span>
              <Button
                type="button"
                variant="accent"
                size="sm"
                flat
                disabled={disabled}
                onClick={() => remove(i)}
                srLabel={removeLabel ? removeLabel(tag) : `Remove ${tag}`}
              >
                ×
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled || full}
          className="flex-1"
          variant="flat"
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          flat
          disabled={disabled || full}
          onClick={add}
          aria-label={addLabel}
        >
          {addLabel ?? '+'}
        </Button>
      </div>
    </div>
  );
}

export type { Props as TagInputProps };
