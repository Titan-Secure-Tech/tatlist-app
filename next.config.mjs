/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable typed routes for better type safety
  typedRoutes: true,

  // Headers for Apple Pay domain verification
  async headers() {
    return [
      {
        source: '/.well-known/apple-developer-merchantid-domain-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Rewrites to serve Apple Pay verification from API route
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite Apple Pay verification requests to the API route
        {
          source: '/.well-known/apple-developer-merchantid-domain-association',
          destination: '/api/apple-pay-verification',
        },
      ],
    };
  },
  // Image configuration for remote patterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9521',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9521',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'luckysupplyusa.com',
        port: '',
        pathname: '/cdn/shop/**',
      },
      {
        protocol: 'https',
        hostname: 'items-images-production.s3.us-west-2.amazonaws.com',
        port: '',
        pathname: '/files/**',
      },
    ],
  },

  // Ignore TypeScript errors during build (like shadcn/ui v4 and Square SDK issues)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig