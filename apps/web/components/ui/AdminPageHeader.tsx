import { Eyebrow } from '@/components/ui/neobrutal';

export interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  className?: string;
}

export function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  className = '',
}: AdminPageHeaderProps) {
  return (
    <header className={`border-b-4 border-ink pb-6 ${className}`}>
      <Eyebrow size="md" color="accent" className="mb-3">
        {eyebrow}
      </Eyebrow>
      <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight text-ink">
        {title}
        <span className="text-primary">.</span>
      </h1>
      <p className="mt-3 font-body text-body-md italic text-ink/70 max-w-2xl border-l-4 border-accent pl-4">
        {subtitle}
      </p>
    </header>
  );
}
