export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

type Agg = { val: number | null }
type Count = { n: number | null }
type Vitals = { lcp: number | null; cls: number | null; tbt: number | null; inp: number | null }

export async function GET() {
  // Latest vitals
  const vit = await sql<Vitals>`
    select lcp, cls, tbt, inp
    from seo_vitals
    where date = (select max(date) from seo_vitals)
    limit 1
  `
  const v = vit.rows[0] || { lcp: null, cls: null, tbt: null, inp: null }

  // CTR avg (last 30d)
  const ctrAvg = await sql<Agg>`
    select avg(ctr)::float as val
    from seo_search
    where date >= current_date - 30
  `
  const ctr = ctrAvg.rows[0]?.val ?? null

  // Indexed pages = count of latest snapshot rows
  const pagesCount = await sql<Count>`
    select count(*)::int as n
    from seo_top_pages
    where date = (select max(date) from seo_top_pages)
  `
  const pagesIndexed = pagesCount.rows[0]?.n ?? 0 // fallback to 0

  return NextResponse.json({
    lcp: v.lcp,
    cls: v.cls,
    tbt: v.tbt,
    inp: v.inp,
    pagesIndexed,
    ctr,
    lastRefreshed: new Date().toISOString(),
  })
}
