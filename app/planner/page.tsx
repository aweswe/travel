import type { Metadata } from 'next';
import { HERO } from '@/constants/brand';
import { TripPlanner } from '@/components/planner/trip-planner';

export const metadata: Metadata = {
  title: 'AI India Trip Planner | Collabcar',
  description:
    'Design an India itinerary around your destination, travel pace and budget. Generate, refine, edit and save your own day-by-day travel plan with Collabcar.',
  openGraph: {
    title: 'AI India Trip Planner | Collabcar',
    description:
      'Design an India itinerary around your destination, travel pace and budget. Generate, refine, edit and save your own day-by-day travel plan with Collabcar.',
    images: [{ url: HERO }],
  },
};

export default function PlannerPage() {
  return (
    <main>
      <TripPlanner />
    </main>
  );
}
