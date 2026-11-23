import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HERO } from '@/constants/brand';
import { TripPlanner } from '@/components/planner/trip-planner';

export const metadata: Metadata = {
  title: 'AI India Trip Planner | Collabcar',
  description:
    'Design an India itinerary around your destination, travel pace and budget. Generate, refine, edit and export professional PDF travel plans powered by Collabcar AI.',
  openGraph: {
    title: 'AI India Trip Planner | Collabcar',
    description:
      'Design an India itinerary around your destination, travel pace and budget. Generate, refine, edit and export professional PDF travel plans powered by Collabcar AI.',
    images: [{ url: HERO }],
  },
};

export default function PlannerPage() {
  return (
    <main>
      <Suspense fallback={<div className="section-rail" style={{ padding: '60px 0', textAlign: 'center' }}>Loading AI Trip Planner…</div>}>
        <TripPlanner />
      </Suspense>
    </main>
  );
}
