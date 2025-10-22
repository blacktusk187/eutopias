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
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Performance Metrics</h2>
          <p className="text-sm text-gray-600">
            Rolling {range}-day window • Last refresh:{' '}
            {summary?.lastRefreshed ? new Date(summary.lastRefreshed).toLocaleString() : '—'}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={range}
            onChange={(e) => setRange(Number(e.target.value) as 7 | 30 | 90)}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
          <Button 
            onClick={() => loadAll()} 
            disabled={loading}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Core Web Vitals</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalsSeries} margin={{ left: 6, right: 20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="LCP" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="CLS" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="TBT" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="INP" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search performance chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Search Performance</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={searchSeries} margin={{ left: 6, right: 20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Legend />
                <Bar dataKey="clicks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="impressions" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top pages table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Pages</h3>
          <span className="text-sm text-gray-500">
            {summary?.lastRefreshed ? new Date(summary.lastRefreshed).toLocaleString() : '—'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Page</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Clicks</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Impressions</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">CTR</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Position</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">LCP</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">CLS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topPages.map((p) => (
                <tr key={p.url} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 max-w-[360px]">
                    <a 
                      href={p.url} 
                      className="text-blue-600 hover:text-blue-800 font-medium truncate block" 
                      target="_blank" 
                      rel="noreferrer"
                    >
                      {p.title || p.url}
                    </a>
                  </td>
                  <td className="py-4 px-4 text-gray-900 font-medium">{p.clicks ?? '—'}</td>
                  <td className="py-4 px-4 text-gray-900">{p.impressions ?? '—'}</td>
                  <td className="py-4 px-4 text-gray-900">{p.ctr != null ? fmtPct(p.ctr) : '—'}</td>
                  <td className="py-4 px-4 text-gray-900">
                    {p.position != null ? p.position.toFixed(1) : '—'}
                  </td>
                  <td className="py-4 px-4 text-gray-900">{p.lcp != null ? fmtSec(p.lcp) : '—'}</td>
                  <td className="py-4 px-4 text-gray-900">{p.cls != null ? p.cls.toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
    <div className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow ${ringClass || ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="text-sm font-medium text-gray-600">{label}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
          {helper && <div className="text-xs text-gray-500">{helper}</div>}
        </div>
      </div>
    </div>
  )
}
