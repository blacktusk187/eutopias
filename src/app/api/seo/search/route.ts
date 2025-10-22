export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

type SearchOut = {
  date: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const range = Number(searchParams.get('range') || 30)

  const r = await sql<SearchOut>`
    select to_char(date,'YYYY-MM-DD') as date,
           clicks, impressions, ctr::float, position::float
    from seo_search
    where date >= current_date - interval '${range} days'
    order by date asc
  `
  return NextResponse.json(r.rows)
}
