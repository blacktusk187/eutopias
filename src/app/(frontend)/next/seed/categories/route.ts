import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { seedNestedCategories } from '@/endpoints/seed/categories'

export const maxDuration = 60

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Allow either: logged-in user OR Authorization: Bearer <CRON_SECRET>
  const authHeader = requestHeaders.get('authorization')
  const cronOk = authHeader === `Bearer ${process.env.CRON_SECRET}`
  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user && !cronOk) return new Response('Action forbidden.', { status: 403 })

  try {
    const payloadReq = await createLocalReq({ user }, payload)
    const summary = await seedNestedCategories(payload, payloadReq)
    return Response.json({ success: true, summary })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding categories' })
    const message = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
