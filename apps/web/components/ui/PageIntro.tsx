import { PageTitle } from '@/components/ui/PageTitle';

export interface PageIntroProps {
  title: string;
  subtitle: string;
}

export function PageIntro({ title, subtitle }: PageIntroProps) {
  return (
    <div>
      <PageTitle size="compact">{title}</PageTitle>
      <p className="text-sm text-ink/70 mt-1">{subtitle}</p>
    </div>
  );
}
