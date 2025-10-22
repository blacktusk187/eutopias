'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Clock, RefreshCcw } from 'lucide-react'

type JobRun = {
  id: number
  job_name: 'gsc' | 'psi'
  status: 'ok' | 'error'
  started_at: string
  finished_at: string | null
  duration_ms: number | null
  meta: Record<string, unknown> | null
  error_message: string | null
}

export default function LastJobRunsWidget({ autoRefreshMs = 60000 }: { autoRefreshMs?: number }) {
  const [gsc, setGsc] = React.useState<JobRun | null>(null)
  const [psi, setPsi] = React.useState<JobRun | null>(null)
  const [loading, setLoading] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [g, p] = await Promise.all([
        fetch('/api/seo/ingest/runs?job=gsc&limit=1', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/seo/ingest/runs?job=psi&limit=1', { cache: 'no-store' }).then((r) => r.json()),
      ])
      setGsc(Array.isArray(g) && g[0] ? g[0] : null)
      setPsi(Array.isArray(p) && p[0] ? p[0] : null)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
    if (autoRefreshMs > 0) {
      const id = setInterval(load, autoRefreshMs)
      return () => clearInterval(id)
    }
  }, [load, autoRefreshMs])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <JobCard title="GSC Ingestion" run={gsc} loading={loading} />
      <JobCard title="PSI Ingestion" run={psi} loading={loading} />
    </div>
  )
}

function JobCard({ title, run, loading }: { title: string; run: JobRun | null; loading: boolean }) {
  const ok = run?.status === 'ok'
  const Icon = ok ? CheckCircle2 : AlertCircle
  const ring = ok ? 'ring-emerald-500/50' : 'ring-rose-500/50'

  return (
    <Card className={`rounded-2xl ring-2 ${run ? ring : 'ring-neutral-300/40'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${ok ? 'text-emerald-600' : 'text-rose-600'}`} />
            <h3 className="font-medium">{title}</h3>
          </div>
          <button
            onClick={() => location.reload()}
            className="inline-flex items-center text-xs gap-1 opacity-70 hover:opacity-100"
            title="Reload page"
          >
            <RefreshCcw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {run ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Row
              label="Status"
              value={ok ? 'OK' : 'Error'}
              valueClass={ok ? 'text-emerald-700' : 'text-rose-700'}
            />
            <Row
              label="Duration"
              value={run.duration_ms != null ? `${(run.duration_ms / 1000).toFixed(1)}s` : '—'}
            />
            <Row label="Started" value={<TimeAgo iso={run.started_at} />} />
            <Row
              label="Finished"
              value={run.finished_at ? <TimeAgo iso={run.finished_at} /> : '—'}
            />
            <MetaRow run={run} />
            {!ok && run.error_message ? (
              <div className="col-span-2 mt-1 text-xs text-rose-700">
                <span className="font-medium">Error:</span> {run.error_message}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {loading ? 'Loading…' : 'No runs recorded yet'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string
  value: React.ReactNode
  valueClass?: string
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-medium ${valueClass || ''}`}>{value}</span>
    </div>
  )
}

function MetaRow({ run }: { run: JobRun }) {
  const m = run.meta || {}
  const entries = Object.entries(m).slice(0, 2)
  if (entries.length === 0) return null
  return (
    <div className="col-span-2 grid grid-cols-2 gap-3">
      {entries.map(([k, v]) => (
        <Row key={k} label={prettyKey(k)} value={String(v)} />
      ))}
    </div>
  )
}

function prettyKey(k: string) {
  return k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function TimeAgo({ iso }: { iso: string }) {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.max(0, now.getTime() - d.getTime())
  const mins = Math.round(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  let rel = `${mins}m ago`
  if (mins < 1) rel = 'just now'
  else if (mins < 60) rel = `${mins}m ago`
  else if (hours < 24) rel = `${hours}h ago`
  else rel = `${days}d ago`

  return <span title={d.toLocaleString()}>{rel}</span>
}
