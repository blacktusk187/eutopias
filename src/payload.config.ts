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
import { getServerSideURL } from './utilities/getURL'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const RAW = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.eutopias.co'
const URL_FIXED = RAW.replace(/^http:\/\//, 'https://').replace('eutopias.co', 'www.eutopias.co')

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
      // Add quick actions into the left navigation pane
      beforeNavLinks: ['@/components/AdminQuickActions'],
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
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  serverURL: URL_FIXED,
  cors: ['https://www.eutopias.co', 'https://eutopias.co'],
  csrf: ['https://www.eutopias.co', 'https://eutopias.co'],

  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
    // Disable dev-time schema pushes during build to avoid interactive prompts
    push: false,
    // Only provide migrations when explicitly requested. This avoids
    // the interactive migration prompt during CI / Next.js builds.
    prodMigrations: process.env.RUN_MIGRATIONS === 'true' ? migrations : undefined,
  }),
  collections: [Pages, Posts, Media, Categories, Tags, Users, Authors],
  // cors: [getServerSideURL()].filter(Boolean),
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
      // Configure to serve files directly from S3
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
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
  // serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.eutopias.co',
})
