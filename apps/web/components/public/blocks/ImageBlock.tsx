/**
 * ImageBlock — gambar editorial dengan caption + opsi link/embed.
 *
 * `embed_url` membungkus gambar jadi tautan (sumber, repo, halaman detail).
 * `caption` dirender sebagai figcaption label kecil ala zine.
 * URL kosong → placeholder bertanda, bukan layout jebol.
 */

import { Eyebrow } from '@/components/ui/neobrutal';
import { Icon, ImagePlaceholder } from '@/components/ui';
import { Image } from '@/components/ui/Image';

import type { ImageBlockData } from '@/lib/post-blocks';
import { isSafeEmbedUrl } from '@/lib/post-blocks';

interface Props {
  block: ImageBlockData;
  /** Label i18n untuk state kosong (URL belum diisi). */
  emptyLabel: string;
}

export function ImageBlock({ block, emptyLabel }: Props) {
  const { url, alt, caption, embed_url: embedUrl } = block.data;

  if (!url) {
    return (
      <figure className="border-4 border-ink bg-surface p-2 shadow-brutal-4">
        <ImagePlaceholder className="aspect-video">
          <Eyebrow size="md" color="surface">
            {emptyLabel}
          </Eyebrow>
        </ImagePlaceholder>
      </figure>
    );
  }

  const linked = isSafeEmbedUrl(embedUrl);

  const image = (
    <Image
      src={url}
      alt={(alt?.trim() || caption?.trim() || '')}
      contain
      className="mx-auto max-h-[36rem] w-full"
    />
  );

  return (
    <figure className="border-4 border-ink bg-surface p-2 shadow-brutal-4">
      {linked ? (
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-all hover:opacity-90"
        >
          {image}
        </a>
      ) : (
        image
      )}

      {caption ? (
        <figcaption className="mt-2 flex items-center justify-center gap-1.5 text-center font-label text-micro uppercase tracking-label text-ink/70">
          {linked ? <Icon name="external" size={12} /> : null}
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
