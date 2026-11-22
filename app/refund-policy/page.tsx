import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { createBreadcrumbSchema } from '@/lib/seo-geo-schema';

export const metadata: Metadata = buildMetadata({
  title: 'Refund & Cancellation Policy | Collabcar Mobility Technologies',
  description:
    'Transparent cancellation rules, timelines, and refund process for chauffeured car bookings and customized India road trip itineraries with Collabcar.',
  path: '/refund-policy',
});

export default function RefundPolicyPage() {
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Refund Policy', url: '/refund-policy' },
  ]);

  return (
    <div className="legal-page section-rail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="eyebrow" style={{ color: 'var(--red)', marginBottom: 12 }}>
        TRANSPARENCY &amp; TRUST
      </div>
      <h1>Refund &amp; Cancellation Policy</h1>
      <p className="last-updated">Effective Date: January 1, 2026 | Last Updated: February 20, 2026</p>

      <div className="legal-prose">
        <h2>1. Cancellation Timelines &amp; Deductions</h2>
        <p>
          We understand that travel plans in India can shift due to airline schedule disruptions, weather events, or medical emergencies. Our refund schedule is tiered as follows:
        </p>
        <ul>
          <li><strong>More than 7 days prior to journey commencement:</strong> 100% refund of advance deposit minus a flat ₹500 administrative payment gateway processing charge.</li>
          <li><strong>Between 48 hours and 7 days prior:</strong> 80% refund of advance deposit (20% retained to cover pre-allocated vehicle holding costs).</li>
          <li><strong>Between 24 hours and 48 hours prior:</strong> 50% refund of advance deposit.</li>
          <li><strong>Less than 24 hours or No-Show:</strong> Advance deposit is non-refundable, as chauffeurs are already positioned and en route to pickup locations.</li>
        </ul>

        <h2>2. Force Majeure &amp; Himalayan Road Closures</h2>
        <p>
          If your booked route becomes impassable due to official Border Roads Organisation (BRO) mountain pass closures, severe landslides, earthquakes, or statutory government curfew orders:
        </p>
        <ul>
          <li>Collabcar provides 100% credit shell valid for 12 months, or</li>
          <li>Re-routes your chauffeured journey to an alternate accessible sector (e.g., diverting from Manali to Dalhousie/Dharamshala) without penalty charges, adjusting solely for fuel and mileage differentials.</li>
        </ul>

        <h2>3. Refund Initiation &amp; Processing Windows</h2>
        <p>
          Approved refunds are credited back to the original source of payment (credit card, debit card, UPI, or Net Banking) within <strong>5 to 7 business days</strong>. An automated SMS and email confirmation with payment bank UTR reference numbers will be dispatched immediately upon initiation.
        </p>

        <h2>4. Contact Our Accounts Desk</h2>
        <p>
          For cancellation requests, please contact your designated trip coordinator or email <a href="mailto:refunds@collabcar.com" className="text-link" style={{ color: 'var(--red)' }}>refunds@collabcar.com</a> referencing your unique Booking ID.
        </p>
      </div>
    </div>
  );
}
