import type { Metadata } from 'next';
import { HERO } from '@/constants/brand';
import { Overview } from '@/components/about/overview';
import { Approach } from '@/components/about/approach';

export const metadata: Metadata = {
  title: 'About Collabcar | What we do',
  description:
    'Collabcar brings customised travel packages, transport, stays and end-to-end planning together for journeys anywhere in India — planned your way, not the crowd’s.',
  openGraph: {
    title: 'About Collabcar | What we do',
    description:
      'Collabcar brings customised travel packages, transport, stays and end-to-end planning together for journeys anywhere in India — planned your way, not the crowd’s.',
    images: [{ url: HERO }],
  },
};

export default function AboutPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About Collabcar',
      description: 'Customised travel planning across India.',
    },
  ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Overview />
      <Approach />
    </main>
  );
}
