'use client';

/**
 * Client component untuk upload file.
 * Pakai native FormData, trigger submit via callback.
 */

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { FileInput } from '@/components/ui/FileInput';

interface Props {
  name: string;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onChange?: (files: File[]) => void;
  defaultPreview?: string;
}

export function FileUpload({
  name,
  accept,
  multiple = false,
  maxSizeMB = 500,
  onChange,
  defaultPreview,
}: Props) {
  const t = useTranslations('admin.shared');
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const list = Array.from(e.target.files ?? []);
    const tooBig = list.find((f) => f.size > maxSizeMB * 1024 * 1024);
    if (tooBig) {
      setError(`File ${tooBig.name} > ${maxSizeMB}MB`);
      return;
    }
    setFiles(list);
    onChange?.(list);
  }

  function clearFile() {
    setFiles([]);
    if (inputRef.current) inputRef.current.value = '';
    onChange?.([]);
  }

  const previewUrl = files[0]
    ? URL.createObjectURL(files[0])
    : defaultPreview;

  return (
    <div>
      <div className="border-2 border-dashed border-ink bg-surface p-4">
        <FileInput
          ref={inputRef}
          name={multiple ? `${name}[]` : name}
          accept={accept}
          multiple={multiple}
          onChange={handleSelect}
        />

        {previewUrl && (
          <div className="mt-3">
            <p className="text-xs text-ink/60 mb-1.5 font-bold uppercase tracking-wide">
              {t('filePreview')}
            </p>
            {files[0]?.type.startsWith('image/') || defaultPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="preview"
                className="max-h-32 border-2 border-ink"
              />
            ) : (
              <div className="border-2 border-ink px-3 py-2 text-sm bg-surface">
                📎 {files[0]?.name ?? t('fileAttached')}
              </div>
            )}
          </div>
        )}

        {files.length > 0 && (
          <Button
            type="button"
            variant="surface"
            size="sm"
            onClick={clearFile}
            className="mt-3 text-xs underline text-primary font-bold hover:text-accent"
          >
            {t('clearSelection')}
          </Button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs font-bold text-primary">{error}</p>
      )}
    </div>
  );
}
