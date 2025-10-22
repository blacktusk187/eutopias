// src/app/seo/page.tsx
'use client'
import MainSeoDashboard from '@/components/seo/MainSeoDashboard'
import LastJobRunsWidget from '@/components/seo/LastJobRunsWidget'

export default function SEODashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Vercel-style header */}
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
                  <a href="/" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Home
                  </a>
                  <a href="/seo" className="text-gray-900 bg-gray-100 px-3 py-2 text-sm font-medium rounded-md">
                    SEO Dashboard
                  </a>
                </nav>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SEO Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Monitor your site's performance, search rankings, and Core Web Vitals
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <LastJobRunsWidget autoRefreshMs={60000} />
          <MainSeoDashboard />
        </div>
      </div>
    </div>
  )
}
