#!/usr/bin/env node
// Checks author socialLinks URLs against production and reports broken links

const BASE_URL = process.env.PROD_BASE_URL || 'https://www.eutopias.co'
const AUTHORS_API_URL = `${BASE_URL}/api/authors`
const POSTS_API_URL = `${BASE_URL}/api/posts`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchAllAuthorsViaAuthorsAPI() {
  const all = []
  let page = 1
  const MAX_PAGES = 50
  while (page <= MAX_PAGES) {
    const url = `${AUTHORS_API_URL}?limit=100&page=${page}&where[_status][equals]=published`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Failed to fetch authors page ${page}: ${res.status}`)
    const json = await res.json()
    const docs = json?.docs || json?.data || []
    if (!Array.isArray(docs) || docs.length === 0) break
    all.push(...docs)
    const totalPages = json?.totalPages || json?.pageCount || 1
    if (page >= totalPages) break
    page += 1
    await sleep(50)
  }
  return all
}

async function fetchAllAuthorsViaPostsAPI() {
  const seenByEmail = new Map()
  let page = 1
  const MAX_PAGES = 50
  while (page <= MAX_PAGES) {
    const url = `${POSTS_API_URL}?limit=50&page=${page}&depth=2&where[_status][equals]=published`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Failed to fetch posts page ${page}: ${res.status}`)
    const json = await res.json()
    const docs = json?.docs || json?.data || []
    if (!Array.isArray(docs) || docs.length === 0) break
    for (const post of docs) {
      const authors = Array.isArray(post?.populatedAuthors) ? post.populatedAuthors : []
      for (const a of authors) {
        const email = a?.email || a?.id || a?.name || Math.random().toString(36).slice(2)
        if (!seenByEmail.has(email)) {
          seenByEmail.set(email, a)
        }
      }
    }
    const totalPages = json?.totalPages || json?.pageCount || 1
    if (page >= totalPages) break
    page += 1
    await sleep(50)
  }
  return Array.from(seenByEmail.values())
}

function isProbablyValidUrl(url) {
  if (!url || typeof url !== 'string') return false
  if (!/^https?:\/\//i.test(url)) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

async function checkUrl(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal })
    // Some platforms reject HEAD; fallback to GET on non-2xx/3xx
    if (!(res.status >= 200 && res.status < 400)) {
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal })
    }
    return { ok: res.status >= 200 && res.status < 400, status: res.status }
  } catch (e) {
    return { ok: false, error: e?.message || 'request failed' }
  } finally {
    clearTimeout(timeout)
  }
}

async function withConcurrency(items, limit, fn) {
  const results = []
  let i = 0
  const workers = Array.from({ length: limit }).map(async () => {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx], idx)
    }
  })
  await Promise.all(workers)
  return results
}

;(async () => {
  console.log(`Fetching authors (trying authors API first): ${AUTHORS_API_URL}`)
  let authors = []
  try {
    authors = await fetchAllAuthorsViaAuthorsAPI()
  } catch (e) {
    console.warn(`Authors API failed: ${e?.message}. Falling back to posts API: ${POSTS_API_URL}`)
    authors = await fetchAllAuthorsViaPostsAPI()
  }
  console.log(`Found ${authors.length} authors`)

  const checks = []
  for (const author of authors) {
    const name = author?.name || '(unnamed author)'
    const links = Array.isArray(author?.socialLinks) ? author.socialLinks : []
    for (const link of links) {
      const url = link?.url
      checks.push({ name, url })
    }
  }

  const results = await withConcurrency(checks, 6, async (item) => {
    const { name, url } = item
    if (!isProbablyValidUrl(url)) {
      return { name, url, ok: false, reason: 'invalid or missing scheme' }
    }
    const res = await checkUrl(url)
    return { name, url, ...res, reason: res.ok ? undefined : res.error || `HTTP ${res.status}` }
  })

  const broken = results.filter((r) => !r.ok)
  if (broken.length === 0) {
    console.log('All author links look good!')
    process.exit(0)
  }

  console.log('\nBroken author links:')
  for (const b of broken) {
    console.log(`- ${b.name}: ${b.url} -> ${b.reason || 'broken'}`)
  }
  process.exitCode = 1
})().catch((e) => {
  console.error('Link check failed:', e)
  process.exit(2)
})
