'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { confirmDialog } from '@/components/ui/dialog-store';
import { toast } from '@/components/ui/toast-store';
import { deleteReviewAction, toggleReviewPublishAction } from './actions';
import type { Review } from '@/lib/types';

interface Props {
  review: Review;
}

export function ReviewRowActions({ review }: Props) {
  const t = useTranslations('admin.reviews');
  const tCommon = useTranslations('common.dialog');
  const [pending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleReviewPublishAction(review.id, !review.is_published);
      if (res.ok) {
        toast.success(review.is_published ? t('hideSuccess') : t('publishSuccess'));
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleDelete = async () => {
    const ok = await confirmDialog({
      title: t('confirmDeleteTitle'),
      message: t('confirmDeleteMessage'),
      confirmLabel: t('deleteConfirm'),
      cancelLabel: tCommon('cancel'),
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      const res = await deleteReviewAction(review.id);
      if (res.ok) {
        toast.success(t('deleteSuccess'));
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={review.is_published ? 'surface' : 'accent'}
        size="sm"
        disabled={pending}
        onClick={handleToggle}
      >
        {review.is_published ? t('hide') : t('publish')}
      </Button>
      <Button
        variant="surface"
        size="sm"
        disabled={pending}
        onClick={handleDelete}
        className="text-danger hover:bg-accent/40 hover:border-danger"
      >
        <Icon name="close" size={14} />
      </Button>
    </div>
  );
}
import { Icon } from '@/components/ui';
