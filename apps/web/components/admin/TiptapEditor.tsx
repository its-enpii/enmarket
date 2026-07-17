'use client';

/**
 * Tiptap WYSIWYG editor — wrapper ringan untuk blog post admin.
 *
 * Output: HTML string yang disimpan ke kolom `content` di DB.
 * Hidden input bernama `content` (atau `name` prop) di-serialize saat form submit
 * server action.
 *
 * Toolbar minimal: bold, italic, h2, h3, link, bullet list, ordered list,
 * blockquote, code, image (embed base64 inline v1 — endpoint image khusus di fase berikut).
 *
 * Styling konten: pakai `.prose-content` class di globals.css (NeoBrutalism override).
 */

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}

export function TiptapEditor({ name, defaultValue = '', placeholder }: Props) {
  const t = useTranslations('admin.shared');
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    immediatelyRender: false, // penting untuk SSR-safe init di Next.js
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: 'border-2 border-ink my-3 max-w-full' },
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class:
          'prose-content min-h-[280px] max-h-[60vh] overflow-y-auto bg-surface border-2 border-ink p-4 focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-all',
      },
    },
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML());
    },
  });

  // Sync hidden input setiap render — React 19 uncontrolled form pattern
  useEffect(() => {
    // Update DOM langsung sebagai fallback kalau state sync telat
    const hidden = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
    if (hidden) hidden.value = html;
  }, [html, name]);

  if (!editor) {
    return (
      <div className="bg-surface border-2 border-ink p-4 text-ink/60 text-sm">
        {t('tiptapLoading')}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={html} />

      <Toolbar editor={editor} />

      {placeholder && !html && (
        <p className="text-xs text-ink/50 italic">{placeholder}</p>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const t = useTranslations('admin.shared');
  const Btn = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={
        'border-2 border-ink px-2.5 py-1 text-sm font-bold min-w-[36px] min-h-[36px] transition-all ' +
        (active
          ? 'bg-ink text-surface shadow-[2px_2px_0_0_var(--color-primary)]'
          : 'bg-surface text-ink hover:bg-accent shadow-[2px_2px_0_0_var(--color-ink)]')
      }
    >
      {children}
    </button>
  );

  function addLink() {
    const url = window.prompt(t('tiptapPromptUrl'));
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  }

  function addImage() {
    const url = window.prompt(t('tiptapPromptImage'));
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div className="flex flex-wrap gap-1.5 bg-surface border-2 border-ink p-2">
      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title={t('tiptapBold')}
      >
        <b>B</b>
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title={t('tiptapItalic')}
      >
        <i>I</i>
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title={t('tiptapH2')}
      >
        H2
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title={t('tiptapH3')}
      >
        H3
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title={t('tiptapBulletList')}
      >
        •
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title={t('tiptapOrderedList')}
      >
        1.
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title={t('tiptapQuote')}
      >
        &ldquo;
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        title={t('tiptapCode')}
      >
        {'</>'}
      </Btn>
      <Btn onClick={addLink} active={editor.isActive('link')} title={t('tiptapLink')}>
        🔗
      </Btn>
      <Btn onClick={addImage} title={t('tiptapImage')}>
        🖼
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().undo().run()}
        title={t('tiptapUndo')}
      >
        ↶
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().redo().run()}
        title={t('tiptapRedo')}
      >
        ↷
      </Btn>
    </div>
  );
}