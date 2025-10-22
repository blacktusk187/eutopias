// src/app/api/seo/ingest/gsc/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import {
  gscClient,
  lastNDaysRange,
  fmt,
  fetchDaily,
  fetchTopPagesForDate,
  type GscDateRow,
  type GscPageRow,
} from '@/lib/gsc'

interface SeoSearchRow {
  date: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface SeoTopPageRow {
  date: string
  url: string
  title: string | null
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export async function GET() {
  const { webmasters, siteUrl } = await gscClient()
  const { startDate, endDate } = lastNDaysRange(30)

  // 1) DAILY METRICS
  const daily: GscDateRow[] = await fetchDaily(webmasters, siteUrl, startDate, endDate)
  for (const r of daily) {
    await sql<SeoSearchRow>`
      insert into seo_search (date, clicks, impressions, ctr, position)
      values (${r.date}, ${r.clicks}, ${r.impressions}, ${r.ctr}, ${r.position})
      on conflict (date) do update set
        clicks=excluded.clicks,
        impressions=excluded.impressions,
        ctr=excluded.ctr,
        position=excluded.position
    `
  }

  // 2) TOP PAGES SNAPSHOT (yesterday)
  const y = fmt(new Date(Date.now() - 86_400_000))
  const pages: GscPageRow[] = await fetchTopPagesForDate(webmasters, siteUrl, y)

  await sql`delete from seo_top_pages where date = ${y}`

  // Explicitly type loop variable
  for (const p of pages) {
    await sql<SeoTopPageRow>`
      insert into seo_top_pages (date, url, title, clicks, impressions, ctr, position)
      values (${y}, ${p.page}, ${null}, ${p.clicks}, ${p.impressions}, ${p.ctr}, ${p.position})
    `
  }

  return NextResponse.json({ ok: true, daily: daily.length, topPages: pages.length })
}
