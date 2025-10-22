// src/app/seo/page.tsx
'use client'
import MainSeoDashboard from '@/components/seo/MainSeoDashboard'
import LastJobRunsWidget from '@/components/seo/LastJobRunsWidget'

export default function SEODashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">SEO Live Dashboard</h1>
          <p className="text-sm text-muted-foreground">Eutopias.co</p>
        </div>
      </header>

      <LastJobRunsWidget autoRefreshMs={60000} />
      <MainSeoDashboard />
    </div>
  )
}
