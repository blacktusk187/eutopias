// src/lib/crux.ts
type CruxPercentiles = {
  p75?: number
}

type CruxMetric = {
  percentiles?: CruxPercentiles
}

type CruxRecord = {
  metrics?: Record<string, CruxMetric>
}

type CruxResponse = {
  record?: CruxRecord
}

/**
 * Fetch origin-level INP p75 from the Chrome UX Report API.
 * Returns seconds (number) or null if unavailable.
 */
export async function fetchCruxOriginINP(origin: string, apiKey: string): Promise<number | null> {
  if (!origin) return null
  try {
    const url = new URL('https://chromeuxreport.googleapis.com/v1/records:queryRecord')
    if (apiKey) url.searchParams.set('key', apiKey)

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Request only the INP metric for the origin
      body: JSON.stringify({ origin, metrics: ['INP'] }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as CruxResponse
    const p75 = json.record?.metrics?.INP?.percentiles?.p75
    // INP p75 is reported in milliseconds
    return typeof p75 === 'number' ? p75 / 1000 : null
  } catch {
    return null
  }
}


