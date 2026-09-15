/**
 * Block-based blogpost model — konten `posts.content`.
 *
 * `content` adalah `longText` di DB. Dua bentuk yang didukung:
 *   1. JSON array of `PostBlock`  → format baru (block-based, hasil editor admin)
 *   2. Plain HTML string          → format lama (Tiptap full-document / markdown)
 *
 * `parsePostContent()` memetakan keduanya ke `PostBlock[]` sehingga renderer
 * publik selalu punya satu bentuk kerja. Bentuk (2) jadi satu blok `rich_text`
 * dengan id `legacy-root` — backward compatible tanpa migration.
 *
 * Parser sengaja defensif: data dari DB bisa malformed (array of non-object,
 * `data` hilang, tipe tak dikenal). Blok rusak dibuang, bukan bikin crash.
 */

export type BlockType = 'rich_text' | 'code' | 'image' | 'video' | 'callout';

export type CalloutTone = 'info' | 'tip' | 'warning';

export interface RichTextBlock {
  id: string;
  type: 'rich_text';
  data: { html: string };
}

export interface CodeBlockData {
  id: string;
  type: 'code';
  data: {
    code: string;
    language?: string;
    filename?: string;
  };
}

export interface ImageBlockData {
  id: string;
  type: 'image';
  data: {
    url: string;
    caption?: string;
    alt?: string;
    /** URL tujuan saat gambar diklik (link ke sumber / lightbox / repo). */
    embed_url?: string;
  };
}

export interface VideoBlockData {
  id: string;
  type: 'video';
  data: {
    url: string;
    /** Override embed URL. Kalau kosong, diturunkan dari `url`. */
    embed_url?: string;
    caption?: string;
  };
}

export interface CalloutBlockData {
  id: string;
  type: 'callout';
  data: {
    text: string;
    tone?: CalloutTone;
  };
}

export type PostBlock =
  | RichTextBlock
  | CodeBlockData
  | ImageBlockData
  | VideoBlockData
  | CalloutBlockData;

/** Id blok hasil fallback legacy — stabil supaya key React tidak berubah-ubah. */
export const LEGACY_BLOCK_ID = 'legacy-root';

const BLOCK_TYPES: readonly string[] = [
  'rich_text',
  'code',
  'image',
  'video',
  'callout',
];

const CALLOUT_TONES: readonly CalloutTone[] = ['info', 'tip', 'warning'];

/**
 * Bahasa yang bisa dipilih di editor kode. Dipakai juga untuk badge header —
 * nilai di luar daftar tetap dirender apa adanya (kode lama / custom tag).
 */
export const CODE_LANGUAGES = [
  'typescript',
  'javascript',
  'php',
  'python',
  'bash',
  'rust',
  'sql',
  'html',
  'css',
  'json',
] as const;

export type CodeLanguage = (typeof CODE_LANGUAGES)[number];

let idSeq = 0;

/**
 * Unik per blok, aman dipanggil di server maupun client (tanpa crypto.randomUUID
 * pun tetap jalan).
 */
export function createBlockId(prefix = 'block'): string {
  idSeq += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${idSeq}-${rand}`;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

function normalizeTone(value: unknown): CalloutTone | undefined {
  return CALLOUT_TONES.includes(value as CalloutTone)
    ? (value as CalloutTone)
    : undefined;
}

/** Validasi + coerce satu nilai unknown jadi `PostBlock`. `null` = buang. */
function normalizeBlock(value: unknown, index: number): PostBlock | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as { id?: unknown; type?: unknown; data?: unknown };
  const type = asString(raw.type);
  if (!BLOCK_TYPES.includes(type)) return null;

  // Blok tanpa id di DB (format lama / manual insert) dapat id stabil supaya
  // key React identik antara render server dan hydration client.
  const id = optionalString(raw.id) ?? `block-${index}`;
  const data =
    raw.data && typeof raw.data === 'object'
      ? (raw.data as Record<string, unknown>)
      : {};

  switch (type) {
    case 'rich_text':
      return { id, type: 'rich_text', data: { html: asString(data.html) } };
    case 'code':
      return {
        id,
        type: 'code',
        data: {
          code: asString(data.code),
          language: optionalString(data.language),
          filename: optionalString(data.filename),
        },
      };
    case 'image':
      return {
        id,
        type: 'image',
        data: {
          url: asString(data.url),
          caption: optionalString(data.caption),
          alt: optionalString(data.alt),
          embed_url: optionalString(data.embed_url),
        },
      };
    case 'video':
      return {
        id,
        type: 'video',
        data: {
          url: asString(data.url),
          embed_url: optionalString(data.embed_url),
          caption: optionalString(data.caption),
        },
      };
    case 'callout':
      return {
        id,
        type: 'callout',
        data: { text: asString(data.text), tone: normalizeTone(data.tone) },
      };
    default:
      return null;
  }
}

/** Konten blok masih "kosong" → tidak layak dirender / disimpan. */
export function isBlockEmpty(block: PostBlock): boolean {
  switch (block.type) {
    case 'rich_text': {
      // Tag saja tanpa teks (mis. '<p><br></p>' dari Tiptap) dianggap kosong.
      const text = block.data.html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
      return text.trim() === '' && !/<img|<iframe|<hr/i.test(block.data.html);
    }
    case 'code':
      return block.data.code.trim() === '';
    case 'image':
    case 'video':
      return block.data.url.trim() === '';
    case 'callout':
      return block.data.text.trim() === '';
    default:
      return true;
  }
}

/**
 * `posts.content` → `PostBlock[]`.
 *
 * - `null`/undefined/kosong → `[]`
 * - JSON array valid → blocks ternormalisasi (tipe tak dikenal dibuang)
 * - selain itu → satu blok `rich_text` legacy (HTML apa adanya)
 */
export function parsePostContent(raw: string | null | undefined): PostBlock[] {
  if (!raw || typeof raw !== 'string') return [];

  const trimmed = raw.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((block, index) => normalizeBlock(block, index))
          .filter((block): block is PostBlock => block !== null);
      }
    } catch {
      // Bukan JSON valid — kemungkinan besar HTML lama yang kebetulan diawali '['.
    }
  }

  return [{ id: LEGACY_BLOCK_ID, type: 'rich_text', data: { html: raw } }];
}

/**
 * `PostBlock[]` → string untuk kolom `content`.
 *
 * Blok kosong dibuang supaya payload & estimasi reading time (strip_tags di
 * backend) tidak membengkak oleh blok iseng yang belum diisi.
 */
export function serializePostBlocks(blocks: PostBlock[]): string {
  const filled = blocks.filter((block) => !isBlockEmpty(block));
  return JSON.stringify(filled);
}

/**
 * Factory blok baru untuk toolbar "Tambah Blok".
 *
 * Hanya dipanggil dari event handler (post-hydration): id yang dihasilkan
 * acak, jadi jangan dipakai sebagai nilai awal state yang ikut di-render
 * di server, supaya tidak mismatch dengan hydration client.
 */
export function createBlock(type: BlockType): PostBlock {
  const id = createBlockId(type);
  switch (type) {
    case 'rich_text':
      return { id, type, data: { html: '' } };
    case 'code':
      return { id, type, data: { code: '', language: 'typescript' } };
    case 'image':
      return { id, type, data: { url: '' } };
    case 'video':
      return { id, type, data: { url: '' } };
    case 'callout':
      return { id, type, data: { text: '', tone: 'info' } };
    default:
      return { id, type: 'rich_text', data: { html: '' } };
  }
}

export type VideoKind = 'youtube' | 'vimeo' | 'file' | 'embed' | 'none';

const YOUTUBE_ID = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
const VIMEO_ID = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/i;
const DIRECT_VIDEO = /\.(?:mp4|webm|ogv|ogg|mov|m4v)(?:$|[?#])/i;

/** Tipe sumber video — menentukan iframe embed atau <video> native. */
export function resolveVideoKind(url: string | undefined): VideoKind {
  if (!url) return 'none';
  const value = url.trim();
  if (value === '') return 'none';
  if (YOUTUBE_ID.test(value)) return 'youtube';
  if (VIMEO_ID.test(value)) return 'vimeo';
  if (DIRECT_VIDEO.test(value)) return 'file';
  if (/^https?:\/\//i.test(value)) return 'embed';
  return 'none';
}

/**
 * URL YouTube/Vimeo → URL player embed.
 *
 * YouTube pakai `youtube-nocookie.com` (tanpa cookie pelacakan, konsisten
 * dengan posture "tanpa analitik" di platform ini). URL lain dilewatkan apa
 * adanya; kalau sudah berupa URL embed, tidak diubah lagi.
 */
export function formatVideoEmbedUrl(url: string): string {
  if (!url) return '';
  const value = url.trim();

  const ytMatch = YOUTUBE_ID.exec(value);
  if (ytMatch?.[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
  }

  const vimeoMatch = VIMEO_ID.exec(value);
  if (vimeoMatch?.[3]) {
    return `https://player.vimeo.com/video/${vimeoMatch[3]}`;
  }

  return value;
}

/**
 * Plain text dari blocks — untuk estimasi waktu baca di sisi web.
 *
 * Backend menghitung `reading_time_minutes` dengan `strip_tags(content)`.
 * Untuk format lama (HTML) itu akurat; untuk JSON blocks, tanda baca & key
 * JSON ikut terhitung, jadi halaman detail memakai angka hasil fungsi ini.
 */
export function blocksToPlainText(blocks: PostBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'rich_text':
          return stripHtml(block.data.html);
        case 'code':
          return block.data.code;
        case 'callout':
          return block.data.text;
        case 'image':
          return `${block.data.alt ?? ''} ${block.data.caption ?? ''}`;
        case 'video':
          return block.data.caption ?? '';
        default:
          return '';
      }
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Estimasi baca (menit) — sama seperti backend: 200 kata per menit, min 1. */
export function estimateReadingMinutes(blocks: PostBlock[]): number {
  const text = blocksToPlainText(blocks);
  if (!text) return 0;
  const words = text.split(' ').filter((word) => word !== '').length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Halaman detail butuh tahu ada <blockquote> di mana pun (legacy atau blok). */
export function contentHasBlockquote(raw: string | null | undefined): boolean {
  return /<blockquote/i.test(raw ?? '');
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/(?:p|div|h[1-6]|li|blockquote|pre)>/gi, ' ')
    .replace(/<[^>]*>/g, ' ');
}

/** URL gambar/iframe aman-embed: hanya http(s) (tanpa javascript:/data: untuk embed). */
export function isSafeEmbedUrl(url: string | undefined): boolean {
  return typeof url === 'string' && /^https:\/\//i.test(url.trim());
}
