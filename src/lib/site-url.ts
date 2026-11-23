/**
 * Canonical Site URL resolver with seamless Vercel preview/production fallback.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim()) {
    const raw = process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, '');
    return raw.startsWith('http') ? raw : `https://${raw}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }
  return 'https://collabcar.com';
}
