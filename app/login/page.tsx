import type { Metadata } from 'next';
import { HERO } from '@/constants/brand';
import { AuthForm } from '@/components/auth/auth-form';

export const metadata: Metadata = {
  title: 'Sign in | Collabcar',
  description:
    'Create your Collabcar account or sign in to draft and save your customised India travel itineraries with your personal AI travel co-pilot.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Sign in | Collabcar',
    description:
      'Create your Collabcar account or sign in to draft and save your customised India travel itineraries with your personal AI travel co-pilot.',
    images: [{ url: HERO }],
  },
};

export default function LoginPage() {
  return (
    <main>
      <AuthForm />
    </main>
  );
}
