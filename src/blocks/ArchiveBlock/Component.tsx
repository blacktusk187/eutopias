import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { id, categories, issueNumber, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    // Build where clause with optional filters
    const whereClause: any = {}

    if (flattenedCategories && flattenedCategories.length > 0) {
      whereClause.categories = {
        in: flattenedCategories,
      }
    }

    // Only filter by issueNumber if it's a valid number
    const hasIssueNumberFilter =
      issueNumber !== null && issueNumber !== undefined && typeof issueNumber === 'number' && !isNaN(issueNumber)

    if (hasIssueNumberFilter) {
      whereClause.issueNumber = {
        equals: issueNumber,
      }
    }

    try {
      const fetchedPosts = await payload.find({
        collection: 'posts',
        depth: 1,
        limit,
        overrideAccess: false,
        // Explicitly select fields to avoid issues if issueNumber column doesn't exist yet
        select: {
          id: true,
          title: true,
          slug: true,
          heroImage: true,
          deck: true,
          content: true,
          categories: true,
          tags: true,
          meta: true,
          publishedAt: true,
          views: true,
          authors: true,
          relatedPosts: true,
          updatedAt: true,
          createdAt: true,
          // Only include issueNumber if we're filtering by it (and it exists in DB)
          ...(hasIssueNumberFilter ? { issueNumber: true } : {}),
        },
        ...(Object.keys(whereClause).length > 0
          ? {
              where: whereClause,
            }
          : {}),
      })

      posts = fetchedPosts.docs
    } catch (error: any) {
      // If the error is about missing issue_number column, retry without issueNumber filter
      if (
        error?.code === '42703' &&
        (error?.message?.includes('issue_number') || error?.message?.includes('issueNumber'))
      ) {
        // Remove issueNumber from where clause and retry
        const { issueNumber: _, ...whereWithoutIssue } = whereClause

        const fetchedPosts = await payload.find({
          collection: 'posts',
          depth: 1,
          limit,
          overrideAccess: false,
          select: {
            id: true,
            title: true,
            slug: true,
            heroImage: true,
            deck: true,
            content: true,
            categories: true,
            tags: true,
            meta: true,
            publishedAt: true,
            views: true,
            authors: true,
            relatedPosts: true,
            updatedAt: true,
            createdAt: true,
          },
          ...(Object.keys(whereWithoutIssue).length > 0
            ? {
                where: whereWithoutIssue,
              }
            : {}),
        })

        posts = fetchedPosts.docs
      } else {
        // Re-throw if it's a different error
        throw error
      }
    }
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      posts = filteredSelectedPosts
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={posts} />
    </div>
  )
}
