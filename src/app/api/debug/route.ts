// src/app/api/debug/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''
  let dbFingerprint = 'unknown'
  try {
    const url = new URL(dbUrl)
    dbFingerprint = `${url.hostname}${url.pathname}`
  } catch {
    dbFingerprint = dbUrl.slice(0, 25) // fallback
  }

  const info = {
    vercelEnv: process.env.VERCEL_ENV || 'local',
    vercelUrl: process.env.VERCEL_URL || 'localhost',
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'not available',
    dbFingerprint,
    payloadEnv: process.env.NODE_ENV,
  }

  return NextResponse.json(info, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
}
