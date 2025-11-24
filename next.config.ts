import {withSentryConfig} from '@sentry/nextjs';
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/config.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bkuqjcbyabaanzgisgcz.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
    // Image optimization - CRITICAL: Reduced to minimize Vercel transformations
    // Only use essential formats and sizes to reduce transformation count
    formats: ['image/webp'], // Removed AVIF to reduce transformations (webp is sufficient)
    deviceSizes: [640, 1200], // Reduced to 2 sizes (mobile, desktop) - was 4
    imageSizes: [64, 128], // Reduced to 2 sizes for small images - was 4
    minimumCacheTTL: 31536000, // 1 year cache
    // Disable image optimization for admin routes (not needed for SEO)
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Cache configuration for Next.js 16
  cacheLife: {
    page: {
      stale: 60,
      revalidate: 300,
      expire: 900,
    },
  },
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Source maps for production debugging (disable in production builds)
  productionBrowserSourceMaps: false,
  // Output configuration for Vercel optimization
  // Note: standalone output removed to avoid Windows symlink permission issues
  // Vercel doesn't require standalone output - it handles builds natively
  // output: 'standalone',
  // Experimental features for bundle optimization
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons', 
      '@radix-ui/react-dialog', 
      '@radix-ui/react-slot',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
      'recharts',
      'sonner',
    ],
  },
  // Server external packages (moved from experimental.serverComponentsExternalPackages in Next.js 16)
  serverExternalPackages: ['@supabase/supabase-js'],
  // Compression (Vercel handles this automatically, but explicit is better)
  compress: true,
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "dimitris-palamidas",

  project: "javascript-nextjs",

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

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
