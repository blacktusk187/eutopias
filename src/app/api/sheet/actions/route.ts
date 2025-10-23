export const runtime = 'nodejs'
import { NextResponse } from 'next/server'

const url = process.env.SHEET_WEBAPP_URL!
const token = process.env.SHEET_WEBAPP_TOKEN!

export async function POST(req: Request) {
  const { action } = await req.json()
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, action }),
  })
  const json = await r.json().catch(() => ({}))
  return NextResponse.json(json, { status: r.ok ? 200 : 500 })
}
