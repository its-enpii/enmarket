import { Link } from '@/i18n/navigation';

interface BackLinkProps {
  href: string;
  label: string;
  className?: string;
}

export function BackLink({ href, label, className = '' }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-block text-sm font-bold text-ink/60 hover:text-primary ${className}`}
    >
      {label}
    </Link>
  );
}
