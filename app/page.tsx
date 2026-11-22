import type { Metadata } from 'next';
import { HERO, LOGO } from '@/constants/brand';
import { Hero } from '@/components/home/hero';
import { Destinations } from '@/components/home/destinations';
import { PlannerPromo } from '@/components/home/planner-promo';
import { HowItWorks } from '@/components/home/how-it-works';
import { Enquiry } from '@/components/home/enquiry';
import { Faq } from '@/components/home/faq';
import { ComparisonMatrix } from '@/components/home/comparison-matrix';
import { LatestGuides } from '@/components/home/latest-guides';
import { buildMetadata } from '@/lib/seo';
import { createFAQSchema } from '@/lib/seo-geo-schema';

export const metadata: Metadata = buildMetadata({
  title: 'Collabcar | Custom India Road Trips & AI Chauffeur Planning',
  description:
    'Plan custom India road journeys with instant AI itinerary drafting, verified commercial chauffeured fleets, transparent state road taxes, and boutique stay reservations.',
  path: '/',
  keywords: [
    'India road trip planner',
    'Chauffeur car rental India',
    'Collabcar vs Zoomcar',
    'Delhi to Ladakh road trip cab',
    'Rajasthan chauffeured tour',
    'Savaari alternative',
    'MakeMyTrip custom road trip',
  ],
});

const homeFaqs = [
  {
    question: 'How is Collabcar different from self-drive rentals like Zoomcar or Revv?',
    answer:
      'Unlike Zoomcar or Revv where renters bear 100% damage liability, high security deposit holds (₹5,000–₹15,000), and must manually queue to pay state border commercial passenger taxes, Collabcar provides experienced professional chauffeurs, zero damage liability, zero security deposits, and transparent all-inclusive quotes covering state permits.',
  },
  {
    question: 'How is Collabcar different from tour operators like MakeMyTrip or Thomas Cook?',
    answer:
      'Traditional travel agencies lock you into rigid bus groups with forced commission shopping halts. Collabcar provides private chauffeured vehicles dedicated exclusively to your group, allowing you to customize your schedule, stops, and boutique stays dynamically using our AI planner.',
  },
  {
    question: 'How does the AI itinerary planner work?',
    answer:
      'Our AI planner combines Google Maps distance data, high-altitude acclimatization models, and seasonal highway alerts to produce a detailed day-wise itinerary in under 60 seconds. You can edit every stop, review indicative costs, and request our operations desk to assign verified drivers.',
  },
  {
    question: 'Are state border taxes and tolls included in the pricing?',
    answer:
      'Yes. Our road quotes clearly detail state commercial road taxes (e.g., Delhi to Rajasthan, Himachal, or Goa), FASTag highway tolls, parking fees, and driver allowances upfront with zero unexpected on-road demands.',
  },
  {
    question: 'Can Collabcar vehicles operate in sensitive mountain regions like Ladakh and Kashmir?',
    answer:
      'Yes. Collabcar operates All India Tourist Permit (AITP) commercial vehicles and coordinates compliant transitions with local union operators in Leh, Nubra Valley, and Pahalgam, guaranteeing safe and lawful passage without impoundment risks.',
  },
];

export default function HomePage() {
  const faqSchema = createFAQSchema(homeFaqs);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Hero />

      {/* AEO Front-loaded Direct Answer Block */}
      <section className="section-rail" style={{ paddingTop: 40, paddingBottom: 20 }}>
        <div
          style={{
            background: 'var(--slate)',
            border: '1px solid var(--line)',
            borderLeft: '4px solid var(--red)',
            borderRadius: '6px',
            padding: '24px 28px',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: 'var(--red)',
              display: 'block',
              marginBottom: 8,
            }}
          >
            AT A GLANCE / WHAT IS COLLABCAR
          </span>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.8,
              color: 'var(--ink)',
              margin: 0,
              fontWeight: 500,
            }}
          >
            Collabcar is an AI-powered travel coordination and chauffeured mobility platform across India.
            Unlike generic packaged tours (MakeMyTrip) or self-drive rentals with high accident liability (Zoomcar),
            Collabcar pairs instant AI itinerary drafting with pre-screened AITP-licensed chauffeurs, transparent
            state border road tax billing, and on-ground permit assistance across 28+ Indian states.
          </p>
        </div>
      </section>

      <Destinations />
      <PlannerPromo />
      <ComparisonMatrix />
      <HowItWorks />
      <LatestGuides />
      <Enquiry />
      <Faq />
    </div>
  );
}
