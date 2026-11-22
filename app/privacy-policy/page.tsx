import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { createBreadcrumbSchema } from '@/lib/seo-geo-schema';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy | Collabcar Mobility Technologies',
  description:
    'Our commitment to safeguarding your data. Read how Collabcar collects, processes, and protects your personal, itinerary, and booking information under Indian DPDP Act 2023.',
  path: '/privacy-policy',
});

export default function PrivacyPolicyPage() {
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Privacy Policy', url: '/privacy-policy' },
  ]);

  return (
    <div className="legal-page section-rail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="eyebrow" style={{ color: 'var(--red)', marginBottom: 12 }}>
        LEGAL &amp; COMPLIANCE
      </div>
      <h1>Privacy Policy</h1>
      <p className="last-updated">Effective Date: January 1, 2026 | Last Updated: February 20, 2026</p>

      <div className="legal-prose">
        <h2>1. Introduction &amp; Corporate Identity</h2>
        <p>
          Collabcar Mobility Technologies Private Limited (&quot;Collabcar&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates 
          the travel coordination portal, AI itinerary planning tools, and chauffeured mobility network accessible at 
          <Link href="/"> collabcar.com</Link>. Registered office: 312, Chattarpur Heritage Lane, New Delhi 110074, India.
        </p>

        <h2>2. Data We Collect</h2>
        <p>
          We adhere to data minimization principles in compliance with India’s Digital Personal Data Protection Act (DPDPA 2023) and global privacy standards:
        </p>
        <ul>
          <li><strong>Identity &amp; Contact Data:</strong> Name, verified email address, Indian/International telephone number, and residential city.</li>
          <li><strong>Travel &amp; Itinerary Inputs:</strong> Route selections, dates of transit, passenger counts, vehicle preferences, and dietary requirements shared during itinerary drafting.</li>
          <li><strong>Permit &amp; Regulatory Data:</strong> Valid photo identification (such as Aadhaar card, Voter ID, or Passport copies) exclusively when you request Collabcar to obtain high-altitude Inner Line Permits (ILP), Protected Area Permits (PAP), or state wildlife sanctuary clearances on your behalf.</li>
          <li><strong>Technical &amp; Telemetry Data:</strong> IP address, device type, browser telemetry, and anonymized session analytics used exclusively to maintain platform performance and detect booking fraud.</li>
        </ul>

        <h2>3. How We Process Your Data</h2>
        <p>
          Your information is processed strictly for:
        </p>
        <ul>
          <li>Generating bespoke road travel itineraries and instant pricing quotes via our AI planner.</li>
          <li>Assigning verified, background-checked chauffeurs and dedicated fleet vehicles for your confirmed journey.</li>
          <li>Liaising with district magistrate administrative portals (e.g., Leh LAHDC, Himachal Pradesh RTO, Andaman or Sikkim border administrations) for statutory travel permits.</li>
          <li>Sending critical real-time journey advisories (e.g., sudden landslide road blocks, mountain pass weather warnings).</li>
        </ul>

        <h2>4. Non-Disclosure &amp; Zero Sale of Personal Data</h2>
        <p>
          <strong>We never sell, rent, or trade your personal information</strong> to third-party ad networks, telemarketers, or unauthorized aggregators. Your data is shared only with certified ground transport partners and verified chauffeurs assigned directly to execute your journey.
        </p>

        <h2>5. Data Retention &amp; Your Statutory Rights</h2>
        <p>
          We retain trip records for statutory financial audit obligations (under Indian tax laws) for a maximum of 7 years. You hold the right to request access, correction, or permanent erasure of your personal account data by emailing our Data Grievance Officer at <a href="mailto:grievance@collabcar.com" className="text-link" style={{ color: 'var(--red)' }}>grievance@collabcar.com</a>.
        </p>
      </div>
    </div>
  );
}
