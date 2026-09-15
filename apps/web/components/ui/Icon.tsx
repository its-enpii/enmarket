import type { SVGProps } from 'react';

export type IconName =
  | 'menu'
  | 'close'
  | 'check'
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-down'
  | 'copy'
  | 'text-block'
  | 'code'
  | 'image'
  | 'play'
  | 'quote'
  | 'info'
  | 'tip'
  | 'warning'
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
  'arrow-up': {
    paths: ['M12 20V5', 'M5 12l7-7 7 7'],
  },
  'arrow-down': {
    paths: ['M12 4v15', 'M19 12l-7 7-7-7'],
  },
  copy: {
    paths: ['M9 9h11v11H9z', 'M15 5H4v11'],
  },
  'text-block': {
    paths: ['M4 6h16', 'M4 10.5h16', 'M4 15h11', 'M4 19.5h7'],
  },
  code: {
    paths: ['M9 8.5 5 12l4 3.5', 'M15 8.5 19 12l-4 3.5'],
  },
  image: {
    paths: ['M4 5h16v14H4z', 'M4 16l4.5-4.5 4 4 3-3L20 16', 'M15.5 8.5h.01'],
  },
  play: {
    paths: ['M8 5.5l10 6.5-10 6.5z'],
  },
  quote: {
    paths: [
      'M9.5 6.5C7 8 5.5 10.5 5.5 13.5v4h5v-5H7.8c.2-1.7 1-3 2.4-4z',
      'M18.5 6.5C16 8 14.5 10.5 14.5 13.5v4h5v-5h-2.7c.2-1.7 1-3 2.4-4z',
    ],
  },
  info: {
    paths: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 11v5.5', 'M12 7.5h.01'],
  },
  tip: {
    paths: [
      'M9.5 17.5h5',
      'M10.5 20.5h3',
      'M12 3a6 6 0 0 0-3.5 10.9v3.6h7v-3.6A6 6 0 0 0 12 3Z',
    ],
  },
  warning: {
    paths: ['M12 3.5 21 19.5H3L12 3.5Z', 'M12 9.5v4', 'M12 16.5h.01'],
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
