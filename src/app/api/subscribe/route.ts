import { NextResponse } from 'next/server'

// Adds an email to a Resend Audience using their REST API.
// Requires env vars: RESEND_API_KEY, RESEND_AUDIENCE_ID
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    // Heuristic: catch common domain typos for popular providers (e.g., gmail.om → gmail.com)
    const domain = normalizedEmail.split('@')[1]
    const labels = domain?.split('.') || []
    const sld = labels.length >= 2 ? labels[labels.length - 2] : undefined
    const tld = labels.length >= 1 ? labels[labels.length - 1] : undefined
    const commonProviders: Record<string, string> = {
      gmail: 'com',
      outlook: 'com',
      hotmail: 'com',
      yahoo: 'com',
      icloud: 'com',
      proton: 'me',
    }
    if (sld && tld) {
      const expectedTld = commonProviders[sld]
      if (expectedTld && tld !== expectedTld) {
        const suggested = `${normalizedEmail.split('@')[0]}@${sld}.${expectedTld}`
        return NextResponse.json(
          { error: `That looks like a typo. Did you mean ${suggested}?` },
          { status: 400 },
        )
      }
    }

    const apiKey = process.env.RESEND_API_KEY
    const audienceId = process.env.RESEND_AUDIENCE_ID

    if (!apiKey || !audienceId) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    // 1) Pre-check if contact already exists in this audience
    try {
      const checkRes = await fetch(
        `https://api.resend.com/audiences/${audienceId}/contacts?email=${encodeURIComponent(normalizedEmail)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
          },
          cache: 'no-store',
        },
      )
      if (checkRes.ok) {
        const checkType = checkRes.headers.get('content-type') || ''
        const checkBody = checkType.includes('application/json') ? await checkRes.json() : null
        const candidates = Array.isArray(checkBody)
          ? checkBody
          : checkBody && Array.isArray(checkBody.data)
            ? checkBody.data
            : []
        const exists = candidates.some(
          (c: any) => typeof c?.email === 'string' && c.email.toLowerCase() === normalizedEmail,
        )
        if (exists) {
          return NextResponse.json(
            { error: 'You are already subscribed with this email.' },
            { status: 409 },
          )
        }
      }
    } catch (e) {
      // If the existence check fails for any reason, fall back to attempting the subscribe
    }

    // Docs: POST https://api.resend.com/audiences/{audience_id}/contacts
    const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email: normalizedEmail }),
      cache: 'no-store',
    })

    const contentType = res.headers.get('content-type') || ''
    const responseBody = contentType.includes('application/json')
      ? await res.json()
      : await res.text()

    if (!res.ok) {
      // Log upstream error for server diagnostics
      console.error('Resend subscribe error:', res.status, responseBody)

      // Contact already exists -> return 409 so client can show a proper error
      if (res.status === 409) {
        return NextResponse.json(
          { error: 'You are already subscribed with this email.' },
          { status: 409 },
        )
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

      if (res.status === 422 && /email/i.test(errorMessage) && /valid/i.test(errorMessage)) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
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
