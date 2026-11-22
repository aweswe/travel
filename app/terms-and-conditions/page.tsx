import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { createBreadcrumbSchema } from '@/lib/seo-geo-schema';

export const metadata: Metadata = buildMetadata({
  title: 'Terms & Conditions | Collabcar Mobility Technologies',
  description:
    'Terms of service, vehicle booking conditions, chauffeur guidelines, state border tax regulations, and customer responsibilities for Collabcar travel operations across India.',
  path: '/terms-and-conditions',
});

export default function TermsAndConditionsPage() {
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Terms & Conditions', url: '/terms-and-conditions' },
  ]);

  return (
    <div className="legal-page section-rail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="eyebrow" style={{ color: 'var(--red)', marginBottom: 12 }}>
        LEGAL &amp; AGREEMENTS
      </div>
      <h1>Terms &amp; Conditions</h1>
      <p className="last-updated">Effective Date: January 1, 2026 | Last Updated: February 20, 2026</p>

      <div className="legal-prose">
        <h2>1. Scope of Agreement</h2>
        <p>
          These Terms and Conditions govern all bookings, chauffeured vehicle allocations, custom road itineraries, and ground coordination services booked through 
          Collabcar Mobility Technologies Private Limited (&quot;Collabcar&quot;). By creating an AI itinerary draft, paying an advance token deposit, or boarding a Collabcar-coordinated vehicle, you unconditionally agree to these terms.
        </p>

        <h2>2. Vehicle Allocation &amp; Operational Standards</h2>
        <ul>
          <li><strong>Vehicle Category:</strong> Bookings specify vehicle classes (e.g., Premium Sedan, Innova Crysta, 4x4 SUV, Tempo Traveller). Specific vehicle models are assigned based on route terrain requirements.</li>
          <li><strong>Maintenance &amp; Cleanliness:</strong> Every vehicle undergoes a 48-point safety check (tyre tread depth, brake pads, fluids, AC efficiency) prior to dispatch.</li>
          <li><strong>Driver Duty Hours:</strong> In strict compliance with Indian Ministry of Road Transport &amp; Highways (MoRTH) safety regulations, driver daily driving duty is capped at 10 hours or 450 km per day (whichever is reached first) to prevent highway fatigue. Drivers are entitled to adequate rest periods between 10:00 PM and 06:00 AM unless emergency mountain transit dictates otherwise.</li>
        </ul>

        <h2>3. Tolls, FASTag &amp; State Commercial Entry Taxes</h2>
        <p>
          Unlike unvetted aggregators who conceal interstate fees, Collabcar quotes clearly specify whether tolls and state entry taxes (commercial passenger entry permits for crossing state lines such as Delhi to Haryana, Rajasthan, Himachal Pradesh, or Uttarakhand) are included in your fixed rate or billed at actual pass-through rates.
        </p>

        <h2>4. High-Altitude &amp; Remote Region Protocols</h2>
        <p>
          For routes crossing sensitive mountain sectors (including Ladakh, Spiti Valley, Zanskar, and Tawang):
        </p>
        <ul>
          <li>Travellers must respect local taxi union boundaries where statutory guidelines necessitate vehicle interchanges (such as internal sightseeing in Leh or Pahalgam).</li>
          <li>In the event of unforeseen natural roadblocks (landslides, flash floods, avalanche warnings, BRO road closures), Collabcar chauffeurs hold ultimate authority regarding route diversion to ensure passenger safety.</li>
        </ul>

        <h2>5. Dispute Resolution &amp; Jurisdiction</h2>
        <p>
          Any disputes arising from services rendered shall be governed exclusively by the laws of India and subject to the exclusive jurisdiction of the competent courts in New Delhi.
        </p>
      </div>
    </div>
  );
}
