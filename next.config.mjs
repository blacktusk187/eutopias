// next.config.mjs
import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'

function normalizeHost(urlStr) {
  try {
    const u = new URL(urlStr)
    // force https + www (canonical)
    u.protocol = 'https:'
    if (u.hostname === 'eutopias.co') u.hostname = 'www.eutopias.co'
    return u
  } catch {
    const u = new URL('https://www.eutopias.co')
    return u
  }
}

function resolvePublicURL() {
  // 1) explicit override wins
  const fromEnv = process.env.NEXT_PUBLIC_SERVER_URL
  // 2) vercel prod domain (can be apex or *.vercel.app)
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL
  // 3) next private origin (dev)
  const fallback = process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

  const chosen = normalizeHost(fromEnv || (prod ? `https://${prod}` : fallback))
  return { protocol: chosen.protocol.replace(':', ''), hostname: chosen.hostname }
}

const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'eutopias-magazine-media'
const S3_REGION = process.env.NEXT_PUBLIC_S3_REGION || 'us-east-2'
const S3_HOST = `${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        ...resolvePublicURL(), // now guaranteed https + www
        pathname: '/**',
      },
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
  redirects,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
