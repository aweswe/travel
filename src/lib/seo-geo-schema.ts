import { LOGO } from '@/constants/brand';
import { getSiteUrl } from '@/lib/site-url';

export const SITE_URL = getSiteUrl();

export const OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Collabcar',
  legalName: 'Collabcar Mobility Technologies Private Limited',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: LOGO,
    width: '1568',
    height: '793',
  },
  foundingDate: '2023',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '312, Chattarpur Heritage Lane',
    addressLocality: 'South West Delhi',
    addressRegion: 'New Delhi',
    postalCode: '110074',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-7417545045',
    contactType: 'customer support',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    'https://twitter.com/collabcar',
    'https://www.instagram.com/collabcar_india',
    'https://www.linkedin.com/company/collabcar',
  ],
};

export const WebSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Collabcar',
  description:
    'Customised India road journeys engineered for travellers. AI itinerary drafting, private chauffeured vehicles, and local ground logistics.',
  publisher: {
    '@id': `${SITE_URL}/#organization`,
  },
  inLanguage: 'en-IN',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export const TravelAgencySchema = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  '@id': `${SITE_URL}/#travelagency`,
  name: 'Collabcar India Travel Operations',
  image: LOGO,
  url: SITE_URL,
  telephone: '+91-7417545045',
  priceRange: '₹₹ - ₹₹₹',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '312, Chattarpur Heritage Lane',
    addressLocality: 'New Delhi',
    addressRegion: 'Delhi',
    postalCode: '110074',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 28.5023,
    longitude: 77.1789,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
  ],
  areaServed: [
    'Delhi NCR',
    'Himachal Pradesh',
    'Ladakh',
    'Uttarakhand',
    'Rajasthan',
    'Kerala',
    'Goa',
    'Meghalaya',
    'Jammu and Kashmir',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.89',
    reviewCount: '1420',
    bestRating: '5',
    worstRating: '1',
  },
};

export function createBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function createFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export interface BlogPostSchemaData {
  title: string;
  slug: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  image: string;
  authorName: string;
  authorJobTitle?: string;
  wordCount: number;
  keywords?: string[];
}

export function createArticleSchema(post: BlogPostSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.description,
    image: [post.image],
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: {
      '@type': 'Person',
      name: post.authorName,
      jobTitle: post.authorJobTitle || 'Senior Travel Logistics Strategist',
      worksFor: {
        '@id': `${SITE_URL}/#organization`,
      },
    },
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    wordCount: post.wordCount,
    inLanguage: 'en-IN',
    keywords: post.keywords ? post.keywords.join(', ') : undefined,
  };
}

export function createHowToSchema(
  name: string,
  description: string,
  steps: { name: string; text: string; url?: string; image?: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: step.name,
      text: step.text,
      ...(step.url && { url: step.url }),
      ...(step.image && { image: step.image }),
    })),
  };
}
