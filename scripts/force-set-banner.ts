// scripts/force-set-banner.ts
import { config } from 'dotenv'
import payload from 'payload'
import payloadConfig from '../src/payload.config'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  await payload.init({ config: payloadConfig })
  const result = await payload.update({
    collection: 'categories',
    id: 90,
    data: { bannerImage: 17 },
    overrideAccess: true,
  })
  console.log('Banner updated:', result.bannerImage)
  process.exit(0)
}
main()
