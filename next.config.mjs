import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'

function resolvePublicURL() {
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const origin = prod
    ? `https://${prod}`
    : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

  try {
    const u = new URL(origin)
    return { protocol: u.protocol.replace(':', ''), hostname: u.hostname }
  } catch {
    return { protocol: 'http', hostname: 'localhost' }
  }
}

const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'eutopias-magazine-media'
const S3_REGION = process.env.NEXT_PUBLIC_S3_REGION || 'us-east-2'
const S3_HOST = `${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        ...resolvePublicURL(),
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: S3_HOST,
        pathname: '/**', // strict policy, but URLs must already include /uploads/
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
