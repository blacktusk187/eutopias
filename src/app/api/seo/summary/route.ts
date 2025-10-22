export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

type CtrAgg = { ctr: number | null }
type Count = { n: number }
type Vitals = { lcp: number | null; cls: number | null; tbt: number | null; inp: number | null }

export async function GET() {
  const latest = await sql<Vitals>`
    select lcp, cls, tbt, inp
    from seo_vitals
    where date = (select max(date) from seo_vitals)
    limit 1
  `
  const ctrAvg = await sql<CtrAgg>`
    select avg(ctr)::float as ctr
    from seo_search
    where date >= current_date - 30
  `
  const pagesCount = await sql<Count>`
    select count(*)::int as n
    from seo_top_pages
    where date = (select max(date) from seo_top_pages)
  `
  const v = latest.rows[0] || { lcp: null, cls: null, tbt: null, inp: null }

  return NextResponse.json({
    lcp: v.lcp,
    cls: v.cls,
    tbt: v.tbt,
    inp: v.inp,
    pagesIndexed: pagesCount.rows[0]?.n ?? null,
    ctr: ctrAvg.rows[0]?.ctr ?? null,
    lastRefreshed: new Date().toISOString(),
  })
}
