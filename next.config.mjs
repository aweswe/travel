/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.hostinger.com',
      },
      {
        protocol: 'https',
        hostname: 'horizons-cdn.hostinger.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async rewrites() {
    const pocketbaseUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
    return [
      {
        source: '/hcgi/platform/:path*',
        destination: `${pocketbaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
