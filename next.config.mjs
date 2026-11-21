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
    ],
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
