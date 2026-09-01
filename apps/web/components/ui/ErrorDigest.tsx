import type { HTMLAttributes } from 'react';

export interface ErrorDigestProps extends HTMLAttributes<HTMLPreElement> {}

export function ErrorDigest({
  className = '',
  children,
  ...rest
}: ErrorDigestProps) {
  return (
    <pre
      className={`mt-4 text-xs text-left bg-ink/5 p-3 border border-ink/20 overflow-x-auto font-mono max-w-xl mx-auto ${className}`}
      {...rest}
    >
      {children}
    </pre>
  );
}
