import sanitizeHtml from 'sanitize-html';

/**
 * Render konten blog post (HTML dari Tiptap) dengan sanitasi.
 *
 * sanitize-html WAJIB karena admin bisa paste HTML/iframe yang berbahaya.
 * Config konservatif: hanya tag editorial yang diizinkan, semua event
 * handler dibuang.
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
 * Server component — sanitize HTML di server, render dengan dangerouslySetInnerHTML.
 * Styling di-handle oleh class `.prose-content` di globals.css.
 */
export function PostContent({ content }: Props) {
  const clean = sanitizeHtml(content, SANITIZE_CONFIG);

  return (
    <div
      className="prose-content"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
