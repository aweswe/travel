import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo-geo-schema';

export type SeoInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

export function buildMetadata(input: SeoInput): Metadata {
  const url = input.path
    ? input.path.startsWith('http')
      ? input.path
      : `${SITE_URL}${input.path.startsWith('/') ? input.path : `/${input.path}`}`
    : SITE_URL;

  const imageUrl = input.image
    ? input.image.startsWith('http')
      ? input.image
      : `${SITE_URL}${input.image.startsWith('/') ? input.image : `/${input.image}`}`
    : `${SITE_URL}/favicon.png`;

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      type: input.type ?? 'website',
      siteName: 'Collabcar',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ],
      ...(input.type === 'article' && {
        publishedTime: input.publishedTime,
        modifiedTime: input.modifiedTime,
        authors: input.authors,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [imageUrl],
      creator: '@collabcar',
    },
    ...(input.noindex && {
      robots: {
        index: false,
        follow: true,
      },
    }),
  };
}

export function seo(_args: unknown, input: SeoInput) {
  return buildMetadata(input);
}
