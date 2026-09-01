import type { Metadata } from 'next';

interface BuildMetadataOptions {
  title: string;
  description?: string;
}

export function buildMetadata({
  title,
  description,
}: BuildMetadataOptions): Metadata {
  return {
    title,
    ...(description ? { description } : {}),
  };
}
