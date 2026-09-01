'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';

import { BORDER, TRANSITION } from './styles';

type Props = {
  label: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  defaultOpen?: boolean;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export function Disclosure({
  label,
  children,
  className = '',
  contentClassName = '',
  defaultOpen = false,
  ...rest
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={className} {...rest}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex w-full items-center justify-between gap-2 cursor-pointer text-left ${BORDER} ${TRANSITION}`}
      >
        <span className="flex-1">{label}</span>
        <span
          aria-hidden="true"
          className={`text-current transition-transform ${open ? 'rotate-90' : ''}`}
        >
          ›
        </span>
      </button>

      {open ? <div className={contentClassName}>{children}</div> : null}
    </div>
  );
}
