import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { seedNestedCategories } from '@/endpoints/seed/categories'

export const maxDuration = 60

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user) return new Response('Action forbidden.', { status: 403 })

  try {
    const payloadReq = await createLocalReq({ user }, payload)
    await seedNestedCategories(payload)
    return Response.json({ success: true })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding categories' })
    return new Response('Error seeding categories.', { status: 500 })
  }
}


