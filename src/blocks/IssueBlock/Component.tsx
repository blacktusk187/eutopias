import React from 'react'
import type { Post, IssueBlock as IssueBlockProps } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { IssueSection } from '@/components/IssueSection'

/**
 * IssueBlock
 * Fetches posts for a specific issue number and displays them in a layout
 * matching the Latest Stories section.
 */
export const IssueBlock: React.FC<IssueBlockProps & { id?: string }> = async (props) => {
  const { issueNumber, id } = props

  const payload = await getPayload({ config: configPromise })

  // Fetch all posts for this issue
  let posts: Post[] = []

  try {
    const fetchedPosts = await payload.find({
      collection: 'posts',
      depth: 2, // Populate relationships (categories, heroImage, meta.image, etc.)
      limit: 100, // Get enough posts to organize
      overrideAccess: false,
      where: {
        issueNumber: {
          equals: issueNumber,
        },
        _status: {
          equals: 'published',
        },
      },
      sort: '-publishedAt', // Sort by most recent first
    })

    posts = fetchedPosts.docs
  } catch (error: any) {
    // If the error is about missing issue_number column, return empty
    if (
      error?.code === '42703' &&
      (error?.message?.includes('issue_number') || error?.message?.includes('issueNumber'))
    ) {
      console.warn(`[IssueBlock] Issue number column not found. Returning empty.`)
      posts = []
    } else {
      // Re-throw if it's a different error
      throw error
    }
  }

  // Organize posts similar to LatestStoriesBlock structure
  // First post becomes featuredMain, next 2 become featuredSub1 and featuredSub2
  // Remaining posts become todaysPicks (up to 8)
  const featuredMain = posts[0] || null
  const featuredSub1 = posts[1] || null
  const featuredSub2 = posts[2] || null
  const todaysPicks = posts.slice(3, 11) // Get up to 8 posts for the left column

  // If we don't have enough posts, return null or a message
  if (posts.length === 0) {
    return null
  }

  return (
    <div id={`block-${id}`}>
      <IssueSection
        issueNumber={issueNumber}
        todaysPicks={todaysPicks}
        featuredMain={featuredMain}
        featuredSub1={featuredSub1}
        featuredSub2={featuredSub2}
      />
    </div>
  )
}

