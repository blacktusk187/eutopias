import React from 'react'
import Link from 'next/link'
import type { Post, FromTheVaultBlock as FromTheVaultBlockProps } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Media } from '@/components/Media'
import { getMediaUrl } from '@/utilities/getMediaUrl'

/**
 * FromTheVaultBlock
 * Displays 4 past issues in a horizontal card layout.
 * Cycles through issues every 24 hours.
 */
export const FromTheVaultBlock: React.FC<FromTheVaultBlockProps & { id?: string }> = async (
  props,
) => {
  const { currentIssueNumber, featuredArticles, id } = props

  const payload = await getPayload({ config: configPromise })

  // Get all unique issue numbers (excluding current issue)
  let allIssues: number[] = []

  try {
    const posts = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      where: {
        and: [
          {
            issueNumber: {
              exists: true,
            },
          },
          {
            issueNumber: {
              not_equals: currentIssueNumber,
            },
          },
        ],
      },
      select: {
        issueNumber: true,
      },
    })

    // Extract unique issue numbers
    const issueSet = new Set<number>()
    posts.docs.forEach((post) => {
      if (post.issueNumber && typeof post.issueNumber === 'number') {
        issueSet.add(post.issueNumber)
      }
    })

    allIssues = Array.from(issueSet).sort((a, b) => b - a) // Sort descending (newest first)
  } catch (error: any) {
    console.warn(`[FromTheVaultBlock] Error fetching issues:`, error)
    allIssues = []
  }

  if (allIssues.length === 0) {
    return null
  }

  // Calculate which 4 issues to display based on 24-hour rotation
  // Use a deterministic approach: calculate days since a reference date, then use modulo
  const referenceDate = new Date('2025-01-01T00:00:00Z')
  const now = new Date()
  const daysSinceReference = Math.floor(
    (now.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24),
  )

  // Determine how many issues we can show (max 4, or all if less than 4)
  const maxIssuesToShow = Math.min(4, allIssues.length)
  const selectedIssues: number[] = []

  if (allIssues.length <= maxIssuesToShow) {
    // If we have 4 or fewer issues, show all of them
    selectedIssues.push(...allIssues)
  } else {
    // Rotate through issues: start index changes every 24 hours
    // Use modulo to cycle through available starting positions
    const maxStartIndex = allIssues.length - maxIssuesToShow + 1
    const startIndex = daysSinceReference % maxStartIndex
    selectedIssues.push(...allIssues.slice(startIndex, startIndex + maxIssuesToShow))
  }

  // Fetch posts for each selected issue and get the featured article
  const issueData = await Promise.all(
    selectedIssues.map(async (issueNum) => {
      // Check if there's a configured featured article for this issue
      const configuredFeatured = featuredArticles?.find(
        (fa) => fa.issueNumber === issueNum && fa.featuredPost,
      )

      let featuredPost: Post | null = null

      if (configuredFeatured?.featuredPost) {
        // Use the configured featured post
        const postId =
          typeof configuredFeatured.featuredPost === 'object'
            ? configuredFeatured.featuredPost.id
            : configuredFeatured.featuredPost

        try {
          const post = await payload.findByID({
            collection: 'posts',
            id: postId,
            depth: 2,
            overrideAccess: false,
          })
          featuredPost = post as Post
        } catch (error) {
          console.warn(`[FromTheVaultBlock] Could not fetch featured post ${postId} for issue ${issueNum}`)
        }
      }

      // If no configured featured post, get the first post from the issue
      if (!featuredPost) {
        try {
          const posts = await payload.find({
            collection: 'posts',
            depth: 2,
            limit: 1,
            overrideAccess: false,
            where: {
              issueNumber: {
                equals: issueNum,
              },
            },
            sort: '-publishedAt',
          })

          if (posts.docs.length > 0) {
            featuredPost = posts.docs[0] as Post
          }
        } catch (error) {
          console.warn(`[FromTheVaultBlock] Could not fetch posts for issue ${issueNum}`)
        }
      }

      return {
        issueNumber: issueNum,
        featuredPost,
      }
    }),
  )

  // Filter out issues that don't have a featured post
  const validIssueData = issueData.filter((data) => data.featuredPost !== null)

  if (validIssueData.length === 0) {
    return null
  }

  // Helper function to get post image
  const getPostImage = (post: Post): { resource?: any; src?: string } | null => {
    const img: unknown = (post as any)?.meta?.image ?? (post as any)?.heroImage ?? null
    if (!img) return null
    if (typeof img === 'object') return { resource: img }
    if (typeof img === 'string' && img.trim()) return { src: getMediaUrl(img) }
    return null
  }

  return (
    <div id={`block-${id}`} className="container mb-20 mt-16">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#003366] mb-4 tracking-tight">
          FROM THE VAULT
        </h2>
        <p className="text-sm md:text-base text-gray-600 mb-3 max-w-3xl mx-auto">
          EXPLORE OUR ARCHIVED ISSUES, HANDPICKED FROM OUR COLLECTION OF PAST PUBLICATIONS.
        </p>
        <Link
          href="/posts"
          className="text-sm text-[#003366] underline hover:text-[#EEBC2A] transition-colors inline-block"
        >
          VIEW ALL ISSUES
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {validIssueData.map(({ issueNumber, featuredPost }) => {
          if (!featuredPost) return null

          const img = getPostImage(featuredPost)
          const category =
            featuredPost.categories && featuredPost.categories.length > 0
              ? typeof featuredPost.categories[0] === 'object'
                ? featuredPost.categories[0].title
                : 'Uncategorized'
              : 'Uncategorized'

          return (
            <Link
              key={issueNumber}
              href={`/posts?issue=${issueNumber}`}
              className="group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4">
                {img ? (
                  <>
                    {img.resource ? (
                      <Media
                        resource={img.resource}
                        fill
                        pictureClassName="absolute inset-0"
                        imgClassName="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : img.src ? (
                      <Media
                        src={img.src}
                        fill
                        pictureClassName="absolute inset-0"
                        imgClassName="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-white mb-2">
                        ISSUE {issueNumber}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-[#EEBC2A] transition-colors">
                  {featuredPost.title}
                </h3>
                {featuredPost.deck?.root?.children?.length ? (
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {(featuredPost.deck.root.children as any[])
                      .map((n: any) => {
                        if (n?.type === 'paragraph' && Array.isArray(n.children)) {
                          return n.children
                            .filter((c: any) => typeof c.text === 'string' && c.text.trim())
                            .map((c: any) => c.text)
                            .join(' ')
                        }
                        if (typeof n?.text === 'string') return n.text
                        return ''
                      })
                      .join(' ')}
                  </div>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

