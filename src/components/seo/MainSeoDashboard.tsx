'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gauge, Activity, TrendingUp, Link as LinkIcon, RefreshCcw, BarChart3 } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

// ---------- Types for API responses ----------
export type Summary = {
  lcp: number | null
  cls: number | null
  tbt: number | null
  inp?: number | null
  pagesIndexed: number | null
  ctr: number | null // 0..1
  lastRefreshed: string
}

export type VitalRow = {
  date: string // YYYY-MM-DD
  LCP: number | null
  CLS: number | null
  TBT: number | null
  INP?: number | null
  pages_tested?: number | null
}

export type SearchRow = {
  date: string // YYYY-MM-DD
  clicks: number
  impressions: number
  ctr: number // 0..1
  position: number // avg position
}

export type TopPage = {
  url: string
  title: string | null
  clicks: number | null
  impressions: number | null
  ctr: number | null // 0..1
  position: number | null
  lcp?: number | null // optional if you later enrich
  cls?: number | null
}

// Small helper to format percent safely
function fmtPct(v: number | null | undefined, digits = 1) {
  return v == null ? '—' : `${(v * 100).toFixed(digits)}%`
}

function fmtSec(v: number | null | undefined) {
  return v == null ? '—' : `${v.toFixed(2)}s`
}

// Status coloring for KPI rings
function statusColor(v: number | null | undefined, good: number, warn: number, reverse = false) {
  if (v == null) return 'ring-neutral-300/50'
  if (!reverse) {
    if (v <= good) return 'ring-emerald-500/50'
    if (v <= warn) return 'ring-amber-500/50'
    return 'ring-rose-500/50'
  } else {
    // reverse means higher is better (e.g., CTR)
    if (v >= good) return 'ring-emerald-500/50'
    if (v >= warn) return 'ring-amber-500/50'
    return 'ring-rose-500/50'
  }
}

export default function MainSeoDashboard() {
  const [summary, setSummary] = React.useState<Summary | null>(null)
  const [vitals, setVitals] = React.useState<VitalRow[]>([])
  const [search, setSearch] = React.useState<SearchRow[]>([])
  const [topPages, setTopPages] = React.useState<TopPage[]>([])
  const [range, setRange] = React.useState<7 | 30 | 90>(30)
  const [loading, setLoading] = React.useState<boolean>(false)

  async function loadAll(r: 7 | 30 | 90 = range) {
    setLoading(true)
    try {
      const [s, v, g, t] = await Promise.all([
        fetch(`/api/seo/summary`, { cache: 'no-store' }).then((r) => r.json() as Promise<Summary>),
        fetch(`/api/seo/vitals?range=${r}`, { cache: 'no-store' }).then(
          (r) => r.json() as Promise<VitalRow[]>,
        ),
        fetch(`/api/seo/search?range=${r}`, { cache: 'no-store' }).then(
          (r) => r.json() as Promise<SearchRow[]>,
        ),
        fetch(`/api/seo/top-pages`, { cache: 'no-store' }).then(
          (r) => r.json() as Promise<TopPage[]>,
        ),
      ])
      setSummary(s)
      setVitals(v)
      setSearch(g)
      setTopPages(t)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    // initial & when range changes
    void loadAll(range)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])

  // Data for charts (recharts friendly)
  const vitalsSeries = React.useMemo(() => {
    return vitals.map((d) => ({
      date: d.date,
      LCP: d.LCP,
      CLS: d.CLS,
      TBT: d.TBT,
      INP: d.INP ?? null,
    }))
  }, [vitals])

  const searchSeries = React.useMemo(() => {
    return search.map((d) => ({
      date: d.date,
      clicks: d.clicks,
      impressions: d.impressions,
      ctr: d.ctr,
    }))
  }, [search])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-semibold">KPIs & Trends</h2>
          <p className="text-sm text-muted-foreground">
            Rolling {range}-day window • Last refresh:{' '}
            {summary?.lastRefreshed ? new Date(summary.lastRefreshed).toLocaleString() : '—'}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={range}
            onChange={(e) => setRange(Number(e.target.value) as 7 | 30 | 90)}
          >
            <option value={7}>7d</option>
            <option value={30}>30d</option>
            <option value={90}>90d</option>
          </select>
          <Button onClick={() => loadAll()} disabled={loading}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          label="Largest Contentful Paint"
          value={fmtSec(summary?.lcp)}
          helper="Target < 2.5s"
          icon={<Gauge className="w-4 h-4" />}
          ringClass={statusColor(summary?.lcp, 2.5, 4)}
        />
        <KPI
          label="Cumulative Layout Shift"
          value={summary?.cls == null ? '—' : summary.cls.toFixed(2)}
          helper="Target < 0.10"
          icon={<Activity className="w-4 h-4" />}
          ringClass={statusColor(summary?.cls, 0.1, 0.25)}
        />
        <KPI
          label="Interaction to Next Paint"
          value={fmtSec(summary?.inp ?? null)}
          helper="Target < 0.2s (nice)"
          icon={<Activity className="w-4 h-4" />}
          ringClass={statusColor(summary?.inp ?? null, 0.2, 0.4)}
        />
        <KPI
          label="Organic CTR"
          value={fmtPct(summary?.ctr)}
          helper="Search Console"
          icon={<TrendingUp className="w-4 h-4" />}
          ringClass={statusColor(summary?.ctr ?? null, 0.06, 0.04, true)}
        />
        <KPI
          label="Indexed Pages (snapshot)"
          value={summary?.pagesIndexed ?? '—'}
          helper="Latest top-pages count"
          icon={<LinkIcon className="w-4 h-4" />}
          ringClass={'ring-neutral-300/50'}
        />
        <KPI
          label="Total Blocking Time"
          value={fmtSec(summary?.tbt)}
          helper="Target < 0.2s"
          icon={<BarChart3 className="w-4 h-4" />}
          ringClass={statusColor(summary?.tbt, 0.2, 0.4)}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Web Vitals line chart */}
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">Core Web Vitals</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsSeries} margin={{ left: 6, right: 20, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="LCP" dot={false} />
                  <Line type="monotone" dataKey="CLS" dot={false} />
                  <Line type="monotone" dataKey="TBT" dot={false} />
                  <Line type="monotone" dataKey="INP" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Search performance chart */}
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">Search Performance</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={searchSeries} margin={{ left: 6, right: 20, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="clicks" />
                  <Bar dataKey="impressions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top pages table */}
      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Top Pages (latest snapshot)</h3>
            <span className="text-xs text-muted-foreground">
              {summary?.lastRefreshed ? new Date(summary.lastRefreshed).toLocaleString() : '—'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Page</th>
                  <th className="py-2 pr-4">Clicks</th>
                  <th className="py-2 pr-4">Impr.</th>
                  <th className="py-2 pr-4">CTR</th>
                  <th className="py-2 pr-4">Pos.</th>
                  <th className="py-2 pr-4">LCP</th>
                  <th className="py-2 pr-4">CLS</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((p) => (
                  <tr key={p.url} className="border-b last:border-0">
                    <td className="py-2 pr-4 max-w-[360px] truncate">
                      <a href={p.url} className="underline" target="_blank" rel="noreferrer">
                        {p.title || p.url}
                      </a>
                    </td>
                    <td className="py-2 pr-4">{p.clicks ?? '—'}</td>
                    <td className="py-2 pr-4">{p.impressions ?? '—'}</td>
                    <td className="py-2 pr-4">{p.ctr != null ? fmtPct(p.ctr) : '—'}</td>
                    <td className="py-2 pr-4">
                      {p.position != null ? p.position.toFixed(1) : '—'}
                    </td>
                    <td className="py-2 pr-4">{p.lcp != null ? fmtSec(p.lcp) : '—'}</td>
                    <td className="py-2 pr-4">{p.cls != null ? p.cls.toFixed(2) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function KPI({
  label,
  value,
  helper,
  icon,
  ringClass,
}: {
  label: string
  value: string | number
  helper?: string
  icon?: React.ReactNode
  ringClass?: string
}) {
  return (
    <Card className={`rounded-2xl ring-2 ${ringClass || 'ring-neutral-300/50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
              {icon}
              {label}
            </div>
            <div className="text-xl font-semibold">{value}</div>
            {helper && <div className="text-xs text-muted-foreground mt-1">{helper}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
