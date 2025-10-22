export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { gscClient, lastNDaysRange, fmt, fetchDaily, fetchTopPagesForDate } from '@/lib/gsc'
import { startJob } from '@/lib/jobs'

export async function GET() {
  const run = await startJob('gsc')
  try {
    const { webmasters, siteUrl } = await gscClient()
    const { startDate, endDate } = lastNDaysRange(30)

    // daily
    const daily = await fetchDaily(webmasters, siteUrl, startDate, endDate)
    for (const r of daily) {
      await sql`
        insert into seo_search (date, clicks, impressions, ctr, position)
        values (${r.date}, ${r.clicks}, ${r.impressions}, ${r.ctr}, ${r.position})
        on conflict (date) do update set
          clicks=excluded.clicks,
          impressions=excluded.impressions,
          ctr=excluded.ctr,
          position=excluded.position
      `
    }

    // top pages (yesterday)
    const y = fmt(new Date(Date.now() - 86_400_000))
    const pages = await fetchTopPagesForDate(webmasters, siteUrl, y)
    await sql`delete from seo_top_pages where date = ${y}`
    for (const p of pages) {
      await sql`
        insert into seo_top_pages (date, url, title, clicks, impressions, ctr, position)
        values (${y}, ${p.page}, ${null}, ${p.clicks}, ${p.impressions}, ${p.ctr}, ${p.position})
      `
    }

    await run.done({ daily: daily.length, topPages: pages.length, date: y })
    return NextResponse.json({ ok: true, daily: daily.length, topPages: pages.length })
  } catch (err) {
    await run.fail(err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
