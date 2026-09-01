import type { ReactNode } from 'react';

interface ErrorStateProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  eyebrowColor?: 'primary' | 'muted';
  titleClassName?: string;
  descriptionClassName?: string;
}

export function ErrorState({
  eyebrow,
  title,
  description,
  actions,
  className = 'mx-auto max-w-2xl px-6 py-16 text-center',
  eyebrowColor = 'primary',
  titleClassName = 'mt-3 text-3xl sm:text-4xl font-bold leading-tight text-ink',
  descriptionClassName = 'mt-4 text-base text-ink/70',
  children,
}: ErrorStateProps) {
  return (
    <div className={className}>
      <p
        className={`text-xs font-bold uppercase tracking-label ${
          eyebrowColor === 'primary' ? 'text-primary' : 'text-ink/60'
        }`}
      >
        {eyebrow}
      </p>
      <h1 className={titleClassName}>{title}</h1>
      <p className={descriptionClassName}>{description}</p>
      {children}
      {actions && <div className="mt-8">{actions}</div>}
    </div>
  );
}
