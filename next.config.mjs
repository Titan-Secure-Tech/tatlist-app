/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },

  // Ignore TypeScript errors during build (like shadcn/ui v4)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig