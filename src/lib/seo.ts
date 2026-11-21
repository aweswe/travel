import type { Metadata } from 'next';

export type SeoInput = {
	title: string;
	description: string;
	path?: string;
	image?: string;
	type?: 'website' | 'article';
	noindex?: boolean;
	jsonLd?: object | object[];
};

export function buildMetadata(input: SeoInput): Metadata {
	return {
		title: input.title,
		description: input.description,
		openGraph: {
			title: input.title,
			description: input.description,
			type: input.type ?? 'website',
			...(input.image && { images: [{ url: input.image }] }),
		},
		twitter: {
			card: input.image ? 'summary_large_image' : 'summary',
			title: input.title,
			description: input.description,
			...(input.image && { images: [input.image] }),
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
