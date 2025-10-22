import { sql } from '@vercel/postgres'

export type JobMeta = Record<string, unknown>

const toJsonbParam = (obj: JobMeta | null | undefined) => (obj == null ? null : JSON.stringify(obj)) // cast to ::jsonb in SQL

export async function startJob(jobName: string) {
  const start = Date.now()

  const res = await sql<{ id: number }>`
    insert into seo_job_runs (job_name, status, started_at)
    values (${jobName}, 'ok', now())
    returning id
  `
  const id = res.rows[0].id

  async function done(meta?: JobMeta | null) {
    const duration = Date.now() - start
    await sql`
      update seo_job_runs
      set finished_at = now(),
          duration_ms = ${duration},
          meta = ${toJsonbParam(meta)}::jsonb
      where id = ${id}
    `
  }

  async function fail(err: unknown, extraMeta?: JobMeta | null) {
    const duration = Date.now() - start
    const msg = err instanceof Error ? err.message : String(err)
    await sql`
      update seo_job_runs
      set finished_at = now(),
          duration_ms = ${duration},
          status = 'error',
          error_message = ${msg},
          meta = ${toJsonbParam(extraMeta)}::jsonb
      where id = ${id}
    `
  }

  return { id, done, fail }
}
