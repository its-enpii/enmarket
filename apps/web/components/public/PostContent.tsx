import sanitizeHtml from 'sanitize-html';
import { getTranslations } from 'next-intl/server';

import { CalloutBlock } from '@/components/public/blocks/CalloutBlock';
import { CodeBlock } from '@/components/public/blocks/CodeBlock';
import { ImageBlock } from '@/components/public/blocks/ImageBlock';
import { VideoBlock } from '@/components/public/blocks/VideoBlock';

import {
  isBlockEmpty,
  parsePostContent,
  type CalloutTone,
  type PostBlock,
} from '@/lib/post-blocks';

/**
 * Renderer konten blog post (Display / jurnal studio).
 *
 * `content` bisa dua bentuk (lihat lib/post-blocks.ts):
 *   1. JSON array of PostBlock → dirender modular: rich_text, code, image,
 *      video, callout.
 *   2. Plain HTML string (post lama) → parsePostContent() membungkusnya jadi
 *      satu blok rich_text, jadi jalur render tetap sama dan tetap disanitasi.
 *
 * sanitize-html WAJIB untuk rich_text karena admin bisa paste HTML/iframe yang
 * berbahaya. Config konservatif: hanya tag editorial yang diizinkan, semua
 * event handler dibuang.
 */
const SANITIZE_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [
    'h2',
    'h3',
    'h4',
    'p',
    'br',
    'strong',
    'em',
    'b',
    'i',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'code',
    'pre',
    'img',
    'hr',
    'span',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    code: ['class'],
    pre: ['class'],
    span: ['class'],
  },
  // Paksa rel="noopener noreferrer" untuk external link + target=_blank
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href ?? '';
      const isExternal = /^https?:\/\//i.test(href);
      return {
        tagName,
        attribs: {
          ...attribs,
          ...(isExternal
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {}),
        },
      };
    },
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'], // data: untuk base64 inline (v1 image di Tiptap)
  },
  // Tolak javascript: dll
  disallowedTagsMode: 'discard',
};

interface Props {
  content: string;
}

/**
 * Server component — parsing & sanitasi di server, tiap blok jadi komponen
 * sendiri. CodeBlock satu-satunya client component (butuh tombol copy).
 * Styling rich text di-handle class `.prose-content` di globals.css.
 */
export async function PostContent({ content }: Props) {
  const blocks = parsePostContent(content).filter(
    (block) => !isBlockEmpty(block),
  );
  const t = await getTranslations('postBlocks');

  if (blocks.length === 0) {
    return (
      <p className="font-body text-ink/60 italic">{t('emptyContent')}</p>
    );
  }

  return (
    <div className="space-y-8">
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          emptyText={t('emptyBlock')}
          emptyImage={t('emptyImage')}
          emptyVideo={t('emptyVideo')}
          videoLabel={t('typeVideo')}
          toneLabels={{
            info: t('toneInfo'),
            tip: t('toneTip'),
            warning: t('toneWarning'),
          }}
      />
      ))}
    </div>
  );
}

interface BlockLabels {
  emptyText: string;
  emptyImage: string;
  emptyVideo: string;
  videoLabel: string;
  toneLabels: Record<CalloutTone, string>;
}

interface BlockProps extends BlockLabels {
  block: PostBlock;
}

function BlockRenderer(props: BlockProps) {
  const { block, emptyText, emptyImage, emptyVideo, videoLabel, toneLabels } =
    props;

  switch (block.type) {
    case 'code':
      return <CodeBlock block={block} />;
    case 'image':
      return <ImageBlock block={block} emptyLabel={emptyImage} />;
    case 'video':
      return (
        <VideoBlock
          block={block}
          emptyLabel={emptyVideo}
          typeLabel={videoLabel}
        />
      );
    case 'callout':
      return <CalloutBlock block={block} toneLabels={toneLabels} />;
    case 'rich_text':
      return <RichTextBlockView html={block.data.html} emptyLabel={emptyText} />;
    default:
      return null;
  }
}

function RichTextBlockView({
  html,
  emptyLabel,
}: {
  html: string;
  emptyLabel: string;
}) {
  const clean = sanitizeHtml(html, SANITIZE_CONFIG);

  if (!clean.trim()) {
    return <p className="font-body text-ink/60 italic">{emptyLabel}</p>;
  }

  return (
    <div
      className="prose-content"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
