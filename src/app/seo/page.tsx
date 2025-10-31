// src/app/seo/page.tsx
'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import MainSeoDashboard from '@/components/seo/MainSeoDashboard'
import LastJobRunsWidget from '@/components/seo/LastJobRunsWidget'

// Lazy-load the Sheet panel (safe to remove if not using the sheet integration)
const SheetPanel = React.lazy(() => import('@/components/seo/SheetPanel'))

type IngestOk =
  | { ok: true; daily?: number; topPages?: number }
  | {
      ok: true
      date?: string
      lcp?: number | null
      cls?: number | null
      tbt?: number | null
      inp?: number | null
      pages_tested?: number
    }
type IngestErr = { ok: false; error?: string }

export default function SEODashboardPage() {
  const [gscLoading, setGscLoading] = React.useState(false)
  const [psiLoading, setPsiLoading] = React.useState(false)
  const [notice, setNotice] = React.useState<string | null>(null)
  const [now, setNow] = React.useState<string | null>(null)

  React.useEffect(() => {
    setNow(new Date().toLocaleString())
  }, [])

  async function runIngest(kind: 'gsc' | 'psi') {
    try {
      kind === 'gsc' ? setGscLoading(true) : setPsiLoading(true)
      setNotice(null)

      const res = await fetch(`/api/seo/ingest/${kind}`, { method: 'GET', cache: 'no-store' })
      const data = (await res.json().catch(() => ({}))) as IngestOk | IngestErr

      if (!res.ok || !('ok' in data) || data.ok !== true) {
        const errMsg = (data as IngestErr)?.error || 'Request failed'
        throw new Error(errMsg)
      }

      // Compose a friendly success message with any counters returned
      const bits: string[] = []
      if ('daily' in data && typeof data.daily === 'number') bits.push(`daily=${data.daily}`)
      if ('topPages' in data && typeof data.topPages === 'number')
        bits.push(`topPages=${data.topPages}`)
      if ('pages_tested' in data && typeof data.pages_tested === 'number')
        bits.push(`pages_tested=${data.pages_tested}`)
      const suffix = bits.length ? ` (${bits.join(', ')})` : ''

      setNotice(`${kind.toUpperCase()} ingest completed${suffix}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setNotice(`${kind.toUpperCase()} ingest failed: ${msg}`)
    } finally {
      kind === 'gsc' ? setGscLoading(false) : setPsiLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="font-semibold text-gray-900">Eutopias</span>
              </div>
              <div className="hidden md:block">
                <nav className="flex space-x-8">
                  <Link
                    href="/"
                    prefetch={false}
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    Home
                  </Link>
                  <Link
                    href="/seo"
                    prefetch={false}
                    className="text-gray-900 bg-gray-100 px-3 py-2 text-sm font-medium rounded-md"
                  >
                    SEO Dashboard
                  </Link>
                </nav>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500" suppressHydrationWarning>
                Last updated: {now ?? '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page header + controls */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SEO Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Monitor your site&apos;s performance, search rankings, and Core Web Vitals
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => runIngest('gsc')}
                disabled={gscLoading}
                className="bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-md text-sm"
              >
                {gscLoading ? 'Running GSC…' : 'Run GSC Ingest'}
              </Button>
              <Button
                onClick={() => runIngest('psi')}
                disabled={psiLoading}
                className="bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-md text-sm"
              >
                {psiLoading ? 'Running PSI…' : 'Run PSI Ingest'}
              </Button>
            </div>
          </div>

          {notice && (
            <div className="mt-3 text-sm px-3 py-2 rounded-md bg-gray-100 text-gray-800 border border-gray-200">
              {notice}
            </div>
          )}

          {/* Job runs (GSC + PSI) */}
          <LastJobRunsWidget autoRefreshMs={60000} />

          {/* KPI + Charts + Top Pages */}
          <MainSeoDashboard />

          {/* Google Sheet panel (lazy, optional) */}
          <React.Suspense
            fallback={
              <div className="rounded-2xl p-4 border bg-white text-sm text-gray-500">
                Loading Google Sheet summary…
              </div>
            }
          >
            <SheetPanel />
          </React.Suspense>
        </div>
      </div>
    </div>
  )
}
