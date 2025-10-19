// src/utilities/getURL.ts
import canUseDOM from './canUseDOM'

export const getServerSideURL = () => {
  // Prefer explicit env; fall back to Vercel or localhost
  const env = process.env.NEXT_PUBLIC_SERVER_URL
  if (env && /^https?:\/\//i.test(env)) return env

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  return 'http://localhost:3000'
}

export const getClientSideURL = () => {
  // Prefer explicit env in the browser too (prevents ":3000" bugs)
  const env = process.env.NEXT_PUBLIC_SERVER_URL
  if (env && /^https?:\/\//i.test(env)) return env

  if (canUseDOM) {
    // window.location.origin is robust (includes protocol + host + port)
    return window.location.origin
  }

  // SSR fallback
  return getServerSideURL()
}
