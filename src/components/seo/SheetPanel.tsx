'use client'
import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type SummaryRow = {
  metric: string
  current: any
  target: any
  status: string | null
  lastChecked: string | null
  notes: string | null
}

export default function SheetPanel() {
  const [rows, setRows] = React.useState<SummaryRow[]>([])
  const [busy, setBusy] = React.useState<string | null>(null)

  async function load() {
    const r = await fetch('/api/seo/sheet/summary', { cache: 'no-store' })
    const json = await r.json()
    setRows(json.rows || [])
  }
  React.useEffect(() => {
    void load()
  }, [])

  async function action(action: string) {
    setBusy(action)
    try {
      const r = await fetch('/api/sheet/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const json = await r.json()
      // optimistic: reload summary after sheet operations
      await load()
      alert(json.ok ? `OK: ${json.ran || action}` : `Error: ${json.error || 'unknown'}`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Google Sheet — Summary</h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => action('pullGSC')} disabled={!!busy}>
              Pull GSC → Sheet
            </Button>
            <Button size="sm" onClick={() => action('refreshColors')} disabled={!!busy}>
              Refresh Colors
            </Button>
            <Button size="sm" onClick={() => action('addRows')} disabled={!!busy}>
              Add 10 Rows
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Metric</th>
                <th className="py-2 pr-4">Current</th>
                <th className="py-2 pr-4">Target</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Last Checked</th>
                <th className="py-2 pr-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.metric} className="border-b last:border-0">
                  <td className="py-2 pr-4">{r.metric}</td>
                  <td className="py-2 pr-4">{String(r.current ?? '—')}</td>
                  <td className="py-2 pr-4">{String(r.target ?? '—')}</td>
                  <td className="py-2 pr-4">{r.status ?? '—'}</td>
                  <td className="py-2 pr-4">{r.lastChecked ?? '—'}</td>
                  <td className="py-2 pr-4">{r.notes ?? '—'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-muted-foreground">
                    No rows (check sheet share & env)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
