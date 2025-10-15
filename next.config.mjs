// next.config.mjs
import { withPayload } from '@payloadcms/next/withPayload'
import importedRedirects from './redirects.js'

// ---- Helpers ---------------------------------------------------------------

const isProd =
  process.env.VERCEL_ENV === 'production' ||
  (process.env.VERCEL === '1' && process.env.NODE_ENV === 'production')

function normalizeHost(urlStr, { forceWWW }) {
  try {
    const u = new URL(urlStr)
    // Always force HTTPS
    u.protocol = 'https:'
    // Only enforce www in production for our apex domain
    if (forceWWW && u.hostname === 'eutopias.co') u.hostname = 'www.eutopias.co'
    return u
  } catch {
    return new URL('https://www.eutopias.co')
  }
}

function resolvePublicURL() {
  // 1) Explicit env wins
  const fromEnv = process.env.NEXT_PUBLIC_SERVER_URL
  // 2) Vercel production domain (e.g., apex or custom)
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL
  // 3) Next private origin (dev)
  const fallback = process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

  const chosen = normalizeHost(fromEnv || (vercelProd ? `https://${vercelProd}` : fallback), {
    forceWWW: isProd,
  })
  return { protocol: chosen.protocol.replace(':', ''), hostname: chosen.hostname }
}

// Media hosts
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'eutopias-magazine-media'
const S3_REGION = process.env.NEXT_PUBLIC_S3_REGION || 'us-east-2'
const S3_HOST = `${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`
const CF_DOMAIN = (process.env.CLOUDFRONT_DOMAIN || '').replace(/\/+$/, '') // no trailing slash

// Merge redirects: keep your existing ./redirects.js (array or function) and
// add a canonical apex -> www rule only in production.
async function buildRedirects() {
  const base = []

  if (isProd) {
    // Redirect apex to www only on the custom domain, never on vercel.app
    base.push({
      source: '/:path*',
      has: [{ type: 'host', value: 'eutopias.co' }],
      destination: 'https://www.eutopias.co/:path*',
      permanent: true,
    })
  }

  if (typeof importedRedirects === 'function') {
    const extra = await importedRedirects()
    return [...base, ...extra]
  }

  if (Array.isArray(importedRedirects)) {
    return [...base, ...importedRedirects]
  }

  return base
}

// ---- Next config -----------------------------------------------------------

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        ...resolvePublicURL(), // your public site (now https + canonical host)
        pathname: '/**',
      },
      // Prefer CloudFront for media if configured
      ...(CF_DOMAIN
        ? [{ protocol: 'https', hostname: new URL(CF_DOMAIN).hostname, pathname: '/**' }]
        : []),
      // Fallback: raw S3 bucket access
      { protocol: 'https', hostname: S3_HOST, pathname: '/**' },
    ],
  },
  webpack: (cfg) => {
    cfg.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return cfg
  },
  reactStrictMode: true,

  // Use a function so we can add the apex->www rule only in prod and
  // still keep your existing redirects.
  async redirects() {
    return buildRedirects()
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
