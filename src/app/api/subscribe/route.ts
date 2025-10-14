import { NextResponse } from 'next/server'

// Adds an email to a Resend Audience using their REST API.
// Requires env vars: RESEND_API_KEY, RESEND_AUDIENCE_ID
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    const audienceId = process.env.RESEND_AUDIENCE_ID

    if (!apiKey || !audienceId) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    // Docs: POST https://api.resend.com/audiences/{audience_id}/contacts
    const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    })

    const contentType = res.headers.get('content-type') || ''
    const responseBody = contentType.includes('application/json')
      ? await res.json()
      : await res.text()

    if (!res.ok) {
      // Log upstream error for server diagnostics
      console.error('Resend subscribe error:', res.status, responseBody)

      // Treat contact already existing as success to keep UX smooth
      if (res.status === 409) {
        return NextResponse.json({ success: true, alreadySubscribed: true })
      }

      // Provide clearer hint when audience id is invalid
      const errorMessage =
        typeof responseBody === 'object' && responseBody && 'message' in responseBody
          ? String((responseBody as any).message)
          : typeof responseBody === 'string'
            ? responseBody
            : 'Unknown error'

      if (res.status === 422 && /uuid/i.test(errorMessage)) {
        return NextResponse.json(
          {
            error: 'Invalid RESEND_AUDIENCE_ID. Use the Audience UUID from Resend.',
            hint: 'In Resend dashboard → Audiences → select audience → copy the UUID id',
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: 'Failed to subscribe',
          upstreamStatus: res.status,
          details: responseBody,
        },
        { status: res.status >= 400 && res.status < 600 ? res.status : 500 },
      )
    }

    return NextResponse.json({ success: true, data: responseBody })
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
