import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable typed routes for better type safety
  typedRoutes: true,

  // Empty turbopack config to silence migration warning
  turbopack: {},

  // Allow dev server access from Tailscale network
  allowedDevOrigins: [
    'jamess-mac-mini.tail5b1923.ts.net',
    '*.tail5b1923.ts.net',
  ],

  // Experimental features
  experimental: {
    // cacheComponents disabled temporarily due to conflicts with route segment configs
  },

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
  // Image configuration for remote patterns and optimization
  images: {
    // Cache optimized images for 30 days (improves performance and reduces costs)
    minimumCacheTTL: 2592000,

    // Device-specific image sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],

    // Image sizes for different use cases
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Image formats (prefer modern formats like WebP and AVIF)
    formats: ['image/webp'],

    // Allowed quality values for next/image
    qualities: [75, 95],

    // Remote image patterns
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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Ignore TypeScript errors during build (like shadcn/ui v4 and Square SDK issues)
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "full-stack-tech",
  project: "tatlist-web",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Webpack-specific configurations
  webpack: {
    // Automatically annotate React components to show their full name in breadcrumbs and session replay
    reactComponentAnnotation: {
      enabled: true,
    },
    // Tree-shake Sentry logger statements to reduce bundle size
    treeshake: {
      removeDebugLogging: true,
    },
  },
})