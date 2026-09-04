import type { SVGProps } from 'react';

export type IconName =
  | 'menu'
  | 'close'
  | 'check'
  | 'arrow-right'
  | 'heart'
  | 'external'
  | 'star'
  | 'crown';

type IconProps = Omit<SVGProps<SVGSVGElement>, 'name' | 'strokeWidth'> & {
  name: IconName;
  size?: number | string;
  strokeWidth?: number;
  filled?: boolean;
  decorative?: boolean;
  label?: string;
};

const ICON_PATHS: Record<IconName, { paths: string[]; filled?: boolean }> = {
  menu: {
    paths: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  },
  close: {
    paths: ['M6 6l12 12', 'M18 6L6 18'],
  },
  check: {
    paths: ['M4 12.5l5.5 5.5L20 6.5'],
  },
  'arrow-right': {
    paths: ['M4 12h16', 'M13 5l7 7-7 7'],
  },
  heart: {
    paths: [
      'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
    ],
  },
  external: {
    paths: ['M7 17L17 7', 'M8 7h9v9'],
  },
  star: {
    paths: ['M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9L12 2.5z'],
    filled: true,
  },
  crown: {
    paths: ['M4 8.5l4 3 4-6 4 6 4-3-1.5 9.5h-13L4 8.5Z'],
    filled: true,
  },
};

export function Icon({
  name,
  size = 16,
  strokeWidth = 2,
  filled: filledOverride,
  decorative = true,
  label,
  className,
  ...props
}: IconProps) {
  if (!decorative && !label) {
    throw new Error('Icon requires a label when decorative is false.');
  }

  const { paths, filled: filledByDefault } = ICON_PATHS[name];
  const filled = filledOverride ?? filledByDefault;

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={filled ? undefined : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
      role={decorative ? undefined : 'img'}
    >
      {!decorative && label ? <title>{label}</title> : null}
      {paths.map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
