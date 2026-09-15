/**
 * VideoBlock — embed YouTube/Vimeo atau file video langsung.
 *
 * - YouTube → player youtube-nocookie (tanpa cookie pelacakan).
 * - Vimeo   → player.vimeo.com.
 * - .mp4/.webm/.mov/dll. → <video controls> native.
 * - URL https lain → dianggap sebagai URL embed langsung.
 *
 * `embed_url` dari editor menang kalau diisi; kalau tidak, sumber diturunkan
 * dari `url`. Container aspect-video + border ink 4px + hard shadow supaya
 * rata dengan blok teks/gambar di kolom baca.
 */

import { Eyebrow } from '@/components/ui/neobrutal';
import { ImagePlaceholder } from '@/components/ui';

import type { VideoBlockData } from '@/lib/post-blocks';
import {
  formatVideoEmbedUrl,
  isSafeEmbedUrl,
  resolveVideoKind,
} from '@/lib/post-blocks';

interface Props {
  block: VideoBlockData;
  /** Label i18n untuk state kosong (URL belum diisi). */
  emptyLabel: string;
  /** Label i18n 'Video' -- jadi title iframe saat caption kosong. */
  typeLabel: string;
}

export function VideoBlock({ block, emptyLabel, typeLabel }: Props) {
  const { url, embed_url: embedUrl, caption } = block.data;

  const source = isSafeEmbedUrl(embedUrl) ? embedUrl!.trim() : url.trim();
  const kind = resolveVideoKind(source);
  const playerUrl = kind === 'file' ? source : formatVideoEmbedUrl(source);

  if (kind === 'none' || !playerUrl) {
    return (
      <figure className="border-4 border-ink bg-surface shadow-brutal-4">
        <ImagePlaceholder className="aspect-video">
          <Eyebrow size="md" color="surface">
            {emptyLabel}
          </Eyebrow>
        </ImagePlaceholder>
      </figure>
    );
  }

  const title = caption?.trim() || typeLabel;

  return (
    <figure>
      <div className="aspect-video overflow-hidden border-4 border-ink bg-ink shadow-brutal-4">
        {kind === 'file' ? (
          <video
            src={playerUrl}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full"
          />
        ) : (
          <iframe
            src={playerUrl}
            title={title}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="h-full w-full"
          />
        )}
      </div>

      {caption ? (
        <figcaption className="mt-2 text-center font-label text-micro uppercase tracking-label text-ink/70">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
