'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/neobrutal';
import { DeleteButton } from '@/components/admin/DeleteButton';
import type { Sponsor } from '@/lib/types';
import { deleteSponsor } from './actions';

interface Props {
  sponsor: Sponsor;
}

export function SponsorRowActions({ sponsor }: Props) {
  const tBtns = useTranslations('common.buttons');

  return (
    <div className="flex items-center gap-2">
      <Button
        href={`/admin/sponsors/${sponsor.id}`}
        variant="surface"
        size="sm"
        flat
        className="px-3 py-1 text-xs uppercase font-bold"
      >
        {tBtns('edit')}
      </Button>
      <DeleteButton
        action={deleteSponsor}
        itemId={sponsor.id}
        itemName={sponsor.name || sponsor.domain}
      />
    </div>
  );
}
