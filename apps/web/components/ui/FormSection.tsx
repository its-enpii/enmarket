import type { ElementType, HTMLAttributes } from 'react';
import { Eyebrow } from '@/components/ui/neobrutal';

export interface FormSectionProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow: string;
  title: string;
  as?: 'h2' | 'h3';
  headingClassName?: string;
  mark?: boolean;
}

export function FormSection({
  eyebrow,
  title,
  as: HeadingTag = 'h2',
  headingClassName = '',
  mark = true,
  className = '',
  ...rest
}: FormSectionProps) {
  return (
    <div className={`border-b-2 border-ink pb-3 ${className}`} {...rest}>
      <Eyebrow size="sm" color="accent">
        {mark ? `✎ ${eyebrow}` : eyebrow}
      </Eyebrow>
      <HeadingTag
        className={`font-display text-xl font-black uppercase tracking-tight text-ink ${headingClassName}`}
      >
        {title}
      </HeadingTag>
    </div>
  );
}
