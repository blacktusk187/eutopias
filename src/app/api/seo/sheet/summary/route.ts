export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { readSummary } from '@/lib/sheets'

export async function GET() {
  const rows = await readSummary()
  // Optional: compute small KPI bundle from the sheet
  const mapped = rows.map((r) => ({
    metric: r[0],
    current: r[1],
    target: r[2],
    status: r[3],
    lastChecked: r[4],
    notes: r[5],
  }))
  return NextResponse.json({ rows: mapped, count: mapped.length })
}
