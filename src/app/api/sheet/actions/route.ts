// src/app/api/sheet/actions/route.ts
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'

const base = process.env.SHEET_WEBAPP_URL!
const token = process.env.SHEET_WEBAPP_TOKEN!

export async function POST(req: Request) {
  const { action } = await req.json()
  const u = new URL(base)
  u.searchParams.set('action', action)
  u.searchParams.set('token', token)

  const r = await fetch(u.toString(), { method: 'GET' })
  const json = await r.json().catch(() => ({}))
  return NextResponse.json(json, { status: r.ok ? 200 : 500 })
}
