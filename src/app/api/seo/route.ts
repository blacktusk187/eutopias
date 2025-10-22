import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'SEO API endpoints available',
    endpoints: {
      search: '/api/seo/search',
      summary: '/api/seo/summary',
      topPages: '/api/seo/top-pages',
      vitals: '/api/seo/vitals',
      ingest: {
        gsc: '/api/seo/ingest/gsc',
        psi: '/api/seo/ingest/psi',
        runs: '/api/seo/ingest/runs',
      },
    },
  })
}
