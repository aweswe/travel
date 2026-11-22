import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CookieBanner } from '@/components/cookie-banner';
import { ScrollToTop } from '@/components/scroll-to-top';
import { ThemeProvider } from '@/components/theme-provider';
import { HERO } from '@/constants/brand';
import { OrganizationSchema, WebSiteSchema, TravelAgencySchema } from '@/lib/seo-geo-schema';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#080c14' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://collabcar.com'),
  title: {
    default: 'Collabcar | Custom India Road Trips & AI Chauffeur Planning',
    template: '%s | Collabcar India',
  },
  description:
    'Customised India road journeys engineered for travellers. Instant AI itinerary drafting with verified private chauffeured vehicles, local permit assistance, and curated stays across 28+ Indian states.',
  keywords: [
    'India road trips',
    'Chauffeur car rental India',
    'Custom India itineraries',
    'Delhi to Ladakh cab',
    'Rajasthan chauffeured tour',
    'Kerala road trip driver',
    'Collabcar vs Zoomcar',
    'Collabcar vs Savaari',
  ],
  authors: [{ name: 'Collabcar Travel Operations Team', url: 'https://collabcar.com' }],
  creator: 'Collabcar Mobility Technologies Pvt Ltd',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'Collabcar | Custom India Road Trips & AI Chauffeur Planning',
    description:
      'Explore India on your terms. Instant AI itinerary drafting, verified local drivers, transparent state-tax billing, and hand-picked boutique stays.',
    images: [{ url: HERO, width: 1200, height: 630, alt: 'Collabcar scenic road trip across India' }],
    type: 'website',
    locale: 'en_IN',
    siteName: 'Collabcar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Collabcar | Custom India Road Trips & AI Chauffeur Planning',
    description:
      'Explore India on your terms. Instant AI itinerary drafting, verified local drivers, transparent state-tax billing, and hand-picked boutique stays.',
    images: [HERO],
  },
  alternates: {
    canonical: 'https://collabcar.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(OrganizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WebSiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(TravelAgencySchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <div id="root" className="min-h-screen flex flex-col justify-between">
            <SiteHeader />
            <main id="main-content" tabIndex={-1} className="flex-1">
              {children}
            </main>
            <SiteFooter />
            <CookieBanner />
            <ScrollToTop />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
