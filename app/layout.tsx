import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CookieBanner } from '@/components/cookie-banner';
import { HERO, LOGO } from '@/constants/brand';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Collabcar | India, planned your way',
    template: '%s | Collabcar',
  },
  description:
    'Discover customised India travel with Collabcar. Draft your own AI itinerary and let our team coordinate your routes, transport, stays and experiences.',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'Collabcar | India, planned your way',
    description:
      'Discover customised India travel with Collabcar. Draft your own AI itinerary and let our team coordinate your routes, transport, stays and experiences.',
    images: [{ url: HERO }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Collabcar | India, planned your way',
    description:
      'Discover customised India travel with Collabcar. Draft your own AI itinerary and let our team coordinate your routes, transport, stays and experiences.',
    images: [HERO],
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
      </head>
      <body suppressHydrationWarning>
        <div id="root">
          <SiteHeader />
          {children}
          <SiteFooter />
          <CookieBanner />
        </div>
      </body>
    </html>
  );
}
