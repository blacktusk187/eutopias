import React from 'react'
import type { Post, LatestStoriesBlock as LatestStoriesBlockProps } from '@/payload-types'
import { LatestStoriesSection } from '@/components/LatestStoriesSection'

/**
 * Type guard to confirm a value is a Post object (very loose on purpose).
 * We only need to know it's not a string ID/null.
 */
const isPostObject = (val: unknown): val is Post => !!val && typeof val === 'object'

/**
 * Normalize a single relationship field coming from Payload:
 * - If it's an object → return it
 * - If it's a string (unpopulated relation id) → return null but warn in dev
 * - If it's null/undefined → return null
 */
const normalizeSingle = (val: unknown, label: string): Post | null => {
  if (isPostObject(val)) return val
  if (typeof val === 'string' && process.env.NODE_ENV === 'development') {
    // Helpful when a shallow fetch or caching serves string IDs

    console.warn(
      `[LatestStoriesBlock] "${label}" arrived as string id (unpopulated). Consider increasing depth in the page query.`,
    )
  }
  return null
}

/**
 * Normalize an array of relationships (Today's Picks)
 */
const normalizeArray = (arr: unknown, label: string): Post[] => {
  if (!Array.isArray(arr)) return []
  const out: Post[] = []
  for (const item of arr) {
    if (isPostObject(item)) {
      out.push(item)
    } else if (typeof item === 'string' && process.env.NODE_ENV === 'development') {
      console.warn(
        `[LatestStoriesBlock] "${label}" contains string ids (unpopulated). Consider increasing depth in the page query.`,
      )
    }
  }
  return out
}

/**
 * LatestStoriesBlock
 * Receives content selected in the CMS and renders the homepage "Latest Stories" section.
 * This component is resilient to unpopulated relations (string ids) and will
 * still render using whatever objects are present. The section itself also
 * handles image normalization (object or string URL) and falls back to heroImage.
 */
export const LatestStoriesBlock: React.FC<LatestStoriesBlockProps & { id?: string }> = (props) => {
  const { todaysPicks, featuredMain, featuredSub1, featuredSub2 } = props

  // These should already be populated by the page query (depth: 2),
  // but we normalize defensively in case of shallow fetch/cached responses.
  const todaysPicksPosts = normalizeArray(todaysPicks, 'todaysPicks')
  const featuredMainPost = normalizeSingle(featuredMain, 'featuredMain')
  const featuredSub1Post = normalizeSingle(featuredSub1, 'featuredSub1')
  const featuredSub2Post = normalizeSingle(featuredSub2, 'featuredSub2')

  return (
    <LatestStoriesSection
      todaysPicks={todaysPicksPosts}
      featuredMain={featuredMainPost}
      featuredSub1={featuredSub1Post}
      featuredSub2={featuredSub2Post}
    />
  )
}
