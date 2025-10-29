// src/lib/psi.ts
type LighthouseAudit = {
  numericValue?: number
}

type LighthouseResult = {
  audits?: Record<string, LighthouseAudit>
}

type PsiResponse = {
  lighthouseResult?: LighthouseResult
  // Field (CrUX) data structures are loosely typed; we only read what we need
  loadingExperience?: any
  originLoadingExperience?: any
}

export type Vitals = {
  lcp: number | null // seconds
  cls: number | null
  tbt: number | null // seconds
  inp: number | null // seconds
}

/** Fetch PSI for one URL (mobile by default) */
export async function fetchPsiForUrl(
  url: string,
  apiKey: string,
  strategy: 'mobile' | 'desktop' = 'mobile',
): Promise<Vitals> {
  const q = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
  q.searchParams.set('url', url)
  q.searchParams.set('strategy', strategy)
  q.searchParams.set('category', 'PERFORMANCE')
  if (apiKey) q.searchParams.set('key', apiKey)

  const res = await fetch(q.toString(), { cache: 'no-store' })
  if (!res.ok) {
    // Fail soft: return nulls so one bad page doesn't kill the batch
    return { lcp: null, cls: null, tbt: null, inp: null }
  }
  const json = (await res.json()) as PsiResponse
  const audits = json.lighthouseResult?.audits ?? {}

  // Classic Lighthouse keys:
  const lcpMs = audits['largest-contentful-paint']?.numericValue
  const cls = audits['cumulative-layout-shift']?.numericValue
  const tbtMs = audits['total-blocking-time']?.numericValue

  // INP may be under experimental key or under 'interactive-to-next-paint' depending on version.
  const inpMs =
    audits['experimental-interaction-to-next-paint']?.numericValue ??
    audits['interaction-to-next-paint']?.numericValue ??
    // Fallback to field (CrUX) data if lab audit missing
    json.loadingExperience?.metrics?.INTERACTION_TO_NEXT_PAINT?.percentile ??
    json.loadingExperience?.metrics?.INTERACTION_TO_NEXT_PAINT?.percentiles?.p75 ??
    json.originLoadingExperience?.metrics?.INTERACTION_TO_NEXT_PAINT?.percentile ??
    json.originLoadingExperience?.metrics?.INTERACTION_TO_NEXT_PAINT?.percentiles?.p75

  return {
    lcp: typeof lcpMs === 'number' ? lcpMs / 1000 : null,
    cls: typeof cls === 'number' ? cls : null,
    tbt: typeof tbtMs === 'number' ? tbtMs / 1000 : null,
    inp: typeof inpMs === 'number' ? inpMs / 1000 : null,
  }
}

/** Average multiple vitals objects, ignoring nulls */
export function averageVitals(samples: Vitals[]): Vitals & { pages_tested: number } {
  const nums = { lcp: 0, cls: 0, tbt: 0, inp: 0 }
  const counts = { lcp: 0, cls: 0, tbt: 0, inp: 0 }
  for (const s of samples) {
    ;(['lcp', 'cls', 'tbt', 'inp'] as const).forEach((k) => {
      const v = s[k]
      if (v != null && !Number.isNaN(v)) {
        ;(nums as any)[k] += v
        ;(counts as any)[k]++
      }
    })
  }
  const avg = (k: keyof typeof nums) => (counts[k] ? nums[k] / counts[k] : null)
  return {
    lcp: avg('lcp'),
    cls: avg('cls'),
    tbt: avg('tbt'),
    inp: avg('inp'),
    pages_tested: samples.length,
  }
}
