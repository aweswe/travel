import type { Metadata } from 'next';
import { HERO, LOGO } from '@/constants/brand';
import { Hero } from '@/components/home/hero';
import { Destinations } from '@/components/home/destinations';
import { PlannerPromo } from '@/components/home/planner-promo';
import { HowItWorks } from '@/components/home/how-it-works';
import { Enquiry } from '@/components/home/enquiry';
import { Faq } from '@/components/home/faq';

export const metadata: Metadata = {
  title: 'Collabcar | India, planned your way',
  description:
    'Discover customised India travel with Collabcar. Draft your own AI itinerary and let our team coordinate your routes, transport, stays and experiences.',
  openGraph: {
    title: 'Collabcar | India, planned your way',
    description:
      'Discover customised India travel with Collabcar. Draft your own AI itinerary and let our team coordinate your routes, transport, stays and experiences.',
    images: [{ url: HERO }],
  },
};

export default function HomePage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Collabcar',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Collabcar',
      logo: LOGO,
      description: 'Customised travel planning across India.',
    },
  ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Destinations />
      <PlannerPromo />
      <HowItWorks />
      <Enquiry />
      <Faq />
    </main>
  );
}
