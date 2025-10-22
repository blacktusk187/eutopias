export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

type Row = {
  date: string
  LCP: number | null
  CLS: number | null
  TBT: number | null
  INP: number | null
  pages_tested: number
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const range = Number(searchParams.get('range') || 30)

  const r = await sql<Row>`
    select to_char(date,'YYYY-MM-DD') as date,
           lcp as "LCP",
           cls as "CLS",
           tbt as "TBT",
           inp as "INP",
           pages_tested
    from seo_vitals
    where date >= current_date - ${range}::integer
    order by date asc
  `
  return NextResponse.json(r.rows)
}
