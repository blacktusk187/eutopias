// src/app/api/sheet/actions/route.ts
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}) as any)
    const action = body?.action as string | undefined

    if (!action) {
      return NextResponse.json({ ok: false, error: 'Missing action' }, { status: 400 })
    }

    const base = process.env.SHEET_WEBAPP_URL
    const token = process.env.SHEET_WEBAPP_TOKEN

    if (!base || !token) {
      return NextResponse.json(
        { ok: false, error: 'Sheet WebApp not configured (missing URL or token)' },
        { status: 500 },
      )
    }

    const u = new URL(base)
    u.searchParams.set('action', action)
    u.searchParams.set('token', token)

    const r = await fetch(u.toString(), { method: 'GET', cache: 'no-store' })
    const json = await r.json().catch(() => ({}))

    const okFlag = typeof json === 'object' && json && 'ok' in json ? Boolean(json.ok) : r.ok
    return NextResponse.json(json, { status: okFlag ? 200 : 502 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Request failed'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
