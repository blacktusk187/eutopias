export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

type TopPageOut = {
  url: string
  title: string | null
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export async function GET() {
  const r = await sql<TopPageOut>`
    select url, title, clicks, impressions, ctr::float, position::float
    from seo_top_pages
    where date = (select max(date) from seo_top_pages)
    order by clicks desc nulls last
    limit 100
  `
  return NextResponse.json(r.rows)
}
