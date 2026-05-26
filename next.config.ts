import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  /** Produktion: gzip/brotli (Standard true; explizit für Hostings wie Netlify) */
  compress: true,
  poweredByHeader: false,
  experimental: {
    /** Kleinere Bundles wenn Paket oft importiert wird */
    optimizePackageImports: ['recharts'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    /** Externe Medien über next/image weiterverarbeitbar (CDN-Bandbreite sparen) */
    remotePatterns: [
      { protocol: 'https', hostname: '*.blob.vercel-storage.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/**' },
    ],
  },
}

export default nextConfig
