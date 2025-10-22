export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { fetchPsiForUrl, averageVitals } from '@/lib/psi'
import { startJob } from '@/lib/jobs'

const PAGE_SAMPLE_COUNT = 25

export async function GET() {
  const run = await startJob('psi')
  try {
    const apiKey = process.env.PAGESPEED_API_KEY || ''
    const origin = process.env.GSC_SITE_URL || ''
    if (!origin) throw new Error('Missing GSC_SITE_URL env')

    const { rows } = await sql<{ url: string }>`
      select url from seo_top_pages
      where date = (select max(date) from seo_top_pages)
      order by clicks desc nulls last
      limit ${PAGE_SAMPLE_COUNT}
    `
    const urls = [origin.replace(/\/$/, '') + '/', ...rows.map((r) => r.url)].filter(Boolean)
    if (urls.length === 0) urls.push(origin.replace(/\/$/, '') + '/')

    const results = []
    for (const u of urls) {
      try {
        results.push(await fetchPsiForUrl(u, apiKey, 'mobile'))
      } catch {
        results.push({ lcp: null, cls: null, tbt: null, inp: null })
      }
    }

    const avg = averageVitals(results)
    const today = new Date().toISOString().slice(0, 10)

    await sql`
      insert into seo_vitals (date, lcp, cls, tbt, inp, source, pages_tested)
      values (${today}, ${avg.lcp}, ${avg.cls}, ${avg.tbt}, ${avg.inp}, 'psi', ${avg.pages_tested})
      on conflict (date, source) do update set
        lcp = excluded.lcp,
        cls = excluded.cls,
        tbt = excluded.tbt,
        inp = excluded.inp,
        pages_tested = excluded.pages_tested
    `

    await run.done({ date: today, pages_tested: avg.pages_tested, sampleUrls: urls.length })
    return NextResponse.json({ ok: true, date: today, ...avg })
  } catch (err) {
    await run.fail(err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
