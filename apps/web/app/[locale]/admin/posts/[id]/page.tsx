import { notFound } from 'next/navigation';
import Link from 'next/link';

import { StatusBadge } from '@/components/admin/StatusBadge';
import { Card } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import {
  POST_STATUS_LABEL,
  type Post,
  type SingleResponse,
} from '@/lib/types';

import { PostForm } from '../PostForm';

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_BG: Record<string, string> = {
  draft: 'bg-surface text-ink',
  published: 'bg-accent text-ink',
  archived: 'bg-ink text-surface',
};

async function loadPost(id: string) {
  try {
    const res = await apiGet<SingleResponse<Post>>(`/api/admin/posts/${id}`);
    return res.data;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) {
      notFound();
    }
    throw err;
  }
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await loadPost(id);
  if (!post) notFound();

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <header className="border-b-4 border-ink pb-6">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
          ✎ Studio / Catatan / Edit
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
          {post.title}<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
          Sunting catatan. Perubahan langsung tersimpan setelah klik Simpan.
        </p>
      </header>

      {/* Quick info */}
      <Card variant="surface" className="p-4 flex flex-wrap items-center gap-3">
        <StatusBadge status={post.status} labelMap={POST_STATUS_LABEL} bgOverride={STATUS_BG} />
        <span className="text-sm">
          <strong>Slug:</strong> <code className="font-mono">{post.slug}</code>
        </span>
        {post.published_at && (
          <span className="text-sm">
            <strong>Publish:</strong> {formatDateTime(post.published_at)}
          </span>
        )}
        <Link
          href="/admin/posts"
          className="ml-auto text-xs underline text-primary font-bold hover:text-accent"
        >
          ← Kembali ke daftar
        </Link>
      </Card>

      <Card variant="surface" className="p-6 md:p-8">
        <PostForm initial={post} />
      </Card>
    </div>
  );
}