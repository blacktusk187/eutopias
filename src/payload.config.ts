// storage-adapter-import-placeholder
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import { s3Storage } from '@payloadcms/storage-s3'

import { Authors } from './collections/Authors'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Tags } from './collections/Tags'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// ==== BEGIN SAFE URL RESOLUTION (CHANGED) ====
const rawServerURL =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  process.env.NEXT_PUBLIC_SERVER_URL ??
  'http://localhost:3000'

function resolveServerURL(raw: string): string {
  try {
    const u = new URL(raw)

    // force https in prod for eutopias domains
    if (u.hostname.endsWith('eutopias.co')) {
      u.protocol = 'https:'
    }

    // add www only if it's exactly the apex (avoid www.www)
    if (u.hostname === 'eutopias.co') {
      u.hostname = 'www.eutopias.co'
    }

    // trim trailing slash
    return u.toString().replace(/\/$/, '')
  } catch {
    // last resort: just trim trailing slash
    return raw.replace(/\/$/, '')
  }
}

const SERVER_URL = resolveServerURL(rawServerURL)

const corsOrigins = Array.from(
  new Set(
    [
      process.env.NEXT_PUBLIC_SERVER_URL,
      process.env.PAYLOAD_PUBLIC_SERVER_URL,
      'https://www.eutopias.co',
      'https://eutopias.co',
      'http://localhost:3000',
      'http://localhost:3002',
    ].filter(Boolean),
  ),
)
// ==== END SAFE URL RESOLUTION (CHANGED) ====

export default buildConfig({
  admin: {
    meta: {
      titleSuffix: ' - Eutopias',
    },
    components: {
      beforeLogin: ['@/components/BeforeLogin#default'],
      beforeDashboard: ['@/components/BeforeDashboard#default'],
      beforeNavLinks: ['@/components/AdminQuickActions#default'],
      graphics: {
        Logo: '@/components/AdminLogo#default',
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },

  // CHANGED
  serverURL: SERVER_URL,

  // CHANGED
  cors: corsOrigins as string[],
  csrf: corsOrigins as string[],

  editor: defaultLexical,

  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
    push: false,
    prodMigrations: process.env.RUN_MIGRATIONS === 'true' ? migrations : undefined,
  }),

  collections: [Pages, Posts, Media, Categories, Tags, Users, Authors],
  globals: [Header, Footer],

  plugins: [
    ...plugins,
    // storage-adapter-placeholder
    s3Storage({
      collections: {
        media: {
          prefix: 'uploads/',
        },
      },
      bucket: process.env.S3_BUCKET_NAME || 'eutopias-magazine-media',
      config: {
        region: process.env.S3_REGION || 'us-east-2',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
      disableLocalStorage: true,
    }),
  ],

  secret: process.env.PAYLOAD_SECRET,
  sharp,

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
