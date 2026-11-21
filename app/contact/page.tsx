import type { Metadata } from 'next';
import { HERO } from '@/constants/brand';
import { ContactSection } from '@/components/contact/contact-section';

export const metadata: Metadata = {
  title: 'Contact Collabcar | Plan your India trip',
  description:
    'Get in touch with the Collabcar travel team. Call +91 7417545045, visit us in Chattarpur, New Delhi, or send a message about your next India journey.',
  openGraph: {
    title: 'Contact Collabcar | Plan your India trip',
    description:
      'Get in touch with the Collabcar travel team. Call +91 7417545045, visit us in Chattarpur, New Delhi, or send a message about your next India journey.',
    images: [{ url: HERO }],
  },
};

export default function ContactPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Collabcar',
      telephone: '+91 7417545045',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '312, Chattarpur',
        addressLocality: 'New Delhi',
        addressCountry: 'IN',
      },
      description: 'Customised travel planning across India.',
    },
  ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactSection />
    </main>
  );
}
