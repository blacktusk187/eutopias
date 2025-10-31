// src/lib/gsc.ts
import { google, webmasters_v3 } from 'googleapis'

/** Environment contract (narrow & checked at runtime) */
function getEnv() {
  const site = process.env.GSC_SITE_URL
  const email = process.env.GOOGLE_CLIENT_EMAIL
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  if (!site) throw new Error('Missing env: GSC_SITE_URL')
  if (!email) throw new Error('Missing env: GOOGLE_CLIENT_EMAIL')
  if (!key) throw new Error('Missing env: GOOGLE_PRIVATE_KEY')
  return { site, email, key }
}

/** GSC client */
export async function gscClient(): Promise<{
  webmasters: webmasters_v3.Webmasters
  siteUrl: string
}> {
  const { site, email, key } = getEnv()
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })
  const webmasters = google.webmasters({ version: 'v3', auth })
  return { webmasters, siteUrl: site }
}

/** Utility date helpers */
export const fmt = (d: Date) => d.toISOString().slice(0, 10)
export function lastNDaysRange(n = 30) {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - n)
  return { startDate: fmt(start), endDate: fmt(end) }
}

/** Typed shapes we’ll use app-wide */
export type GscDateRow = {
  date: string // YYYY-MM-DD
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export type GscPageRow = {
  page: string // URL
  clicks: number
  impressions: number
  ctr: number
  position: number
}

/** Map GSC API rows → typed GscDateRow[] */
export function toDateRows(rows: webmasters_v3.Schema$ApiDataRow[] | undefined): GscDateRow[] {
  return (rows || []).map((r) => ({
    date: String(r.keys?.[0] ?? ''),
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }))
}

/** Map GSC API rows → typed GscPageRow[] */
export function toPageRows(rows: webmasters_v3.Schema$ApiDataRow[] | undefined): GscPageRow[] {
  return (rows || []).map((r) => ({
    page: String(r.keys?.[0] ?? ''),
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }))
}

/** Fetch daily metrics (dimension: date) */
export async function fetchDaily(
  client: webmasters_v3.Webmasters,
  siteUrl: string,
  startDate: string,
  endDate: string,
): Promise<GscDateRow[]> {
  const res = await client.searchanalytics.query({
    siteUrl,
    requestBody: { startDate, endDate, dimensions: ['date'] },
  })
  return toDateRows(res.data.rows)
}

/** Fetch paged top pages snapshot (dimension: page) */
export async function fetchTopPagesForDate(
  client: webmasters_v3.Webmasters,
  siteUrl: string,
  date: string,
  rowLimit = 250,
  maxRows = 5000,
): Promise<GscPageRow[]> {
  let startRow = 0
  const out: GscPageRow[] = []
  while (startRow < maxRows) {
    const res = await client.searchanalytics.query({
      siteUrl,
      requestBody: { startDate: date, endDate: date, dimensions: ['page'], rowLimit, startRow },
    })
    const part = toPageRows(res.data.rows)
    out.push(...part)
    if (part.length < rowLimit) break
    startRow += rowLimit
  }
  return out
}

/** Fetch top pages for a date RANGE (aggregated), paged */
export async function fetchTopPagesForRange(
  client: webmasters_v3.Webmasters,
  siteUrl: string,
  startDate: string,
  endDate: string,
  rowLimit = 250,
  maxRows = 5000,
): Promise<GscPageRow[]> {
  let startRow = 0
  const out: GscPageRow[] = []
  while (startRow < maxRows) {
    const res = await client.searchanalytics.query({
      siteUrl,
      requestBody: { startDate, endDate, dimensions: ['page'], rowLimit, startRow },
    })
    const part = toPageRows(res.data.rows)
    out.push(...part)
    if (part.length < rowLimit) break
    startRow += rowLimit
  }
  return out
}
