import { AdminPageHeader, AdminPageBody } from '@/components/ui';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { StatusBadge } from '@/components/admin/StatusBadge';
import { Card, NLink } from '@/components/ui/neobrutal';
import { ApiRequestError, apiGet } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import {
  POST_STATUS_LABEL,
  type Post,
  type SingleResponse,
} from '@/lib/types';

import { PostForm } from '../PostForm';
import { POST_STATUS_COLORS } from '@/lib/status';

interface Props {
  params: Promise<{ id: string }>;
}

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
  const [post, t] = await Promise.all([
    loadPost(id),
    getTranslations('admin.posts'),
  ]);
  if (!post) notFound();

  return (
    <AdminPageBody>
      <AdminPageHeader
        eyebrow={t('editEyebrow')}
        title={post.title}
        subtitle={t('editSubtitle')}
      />

      {/* Quick info */}
      <Card variant="surface" className="p-4 flex flex-wrap items-center gap-3">
        <StatusBadge status={post.status} labelMap={POST_STATUS_LABEL} bgOverride={POST_STATUS_COLORS} />
        <span className="text-sm">
          <strong>{t('quickInfo.slug')}:</strong> <code className="font-mono">{post.slug}</code>
        </span>
        {post.published_at && (
          <span className="text-sm">
            <strong>{t('quickInfo.publish')}:</strong> {formatDateTime(post.published_at)}
          </span>
        )}
        <NLink
          href="/admin/posts"
          variant="primary"
          underline="static"
          className="ml-auto text-xs"
        >
          {t('quickInfo.backToList')}
        </NLink>
      </Card>

      <Card variant="surface" className="p-6 md:p-8">
        <PostForm initial={post} />
      </Card>
    </AdminPageBody>
  );
}
