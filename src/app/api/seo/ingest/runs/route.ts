export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

type Run = {
  id: number
  job_name: string
  status: 'ok' | 'error'
  started_at: string
  finished_at: string | null
  duration_ms: number | null
  meta: unknown
  error_message: string | null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const job = searchParams.get('job') // 'gsc' | 'psi' | null
  const limit = Number(searchParams.get('limit') || 20)

  const q = job
    ? sql<Run>`select * from seo_job_runs where job_name = ${job} order by started_at desc limit ${limit}`
    : sql<Run>`select * from seo_job_runs order by started_at desc limit ${limit}`

  const { rows } = await q
  return NextResponse.json(rows)
}
