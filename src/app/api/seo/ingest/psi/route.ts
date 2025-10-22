export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { fetchPsiForUrl, averageVitals } from '@/lib/psi'

/** How many pages to test daily (besides homepage) */
const PAGE_SAMPLE_COUNT = 25

export async function GET() {
  const apiKey = process.env.PAGESPEED_API_KEY || ''
  const origin = process.env.GSC_SITE_URL || '' // reuse this as canonical origin
  if (!origin)
    return NextResponse.json({ ok: false, error: 'Missing GSC_SITE_URL env' }, { status: 500 })

  // 1) Candidate URLs: homepage + top pages from last snapshot
  const { rows } = await sql<{ url: string }>`
    select url from seo_top_pages
    where date = (select max(date) from seo_top_pages)
    order by clicks desc nulls last
    limit ${PAGE_SAMPLE_COUNT}
  `
  const urls = [origin.replace(/\/$/, '') + '/', ...rows.map((r) => r.url)].filter(Boolean)

  // Fallback if table is empty
  if (urls.length === 0) urls.push(origin.replace(/\/$/, '') + '/')

  // 2) Fetch PSI for each URL (mobile). Keep it sequential to avoid quota spikes.
  const results = []
  for (const u of urls) {
    try {
      const vit = await fetchPsiForUrl(u, apiKey, 'mobile')
      results.push(vit)
    } catch {
      results.push({ lcp: null, cls: null, tbt: null, inp: null })
    }
  }

  // 3) Average & store
  const avg = averageVitals(results)
  const today = new Date().toISOString().slice(0, 10)

  await sql /* sql */ `
    insert into seo_vitals (date, lcp, cls, tbt, inp, source, pages_tested)
    values (${today}, ${avg.lcp}, ${avg.cls}, ${avg.tbt}, ${avg.inp}, 'psi', ${avg.pages_tested})
    on conflict (date, source) do update set
      lcp = excluded.lcp,
      cls = excluded.cls,
      tbt = excluded.tbt,
      inp = excluded.inp,
      pages_tested = excluded.pages_tested
  `

  return NextResponse.json({ ok: true, date: today, ...avg })
}
