import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-dynamic'
export const revalidate = 600

type Args = {
  searchParams: Promise<{
    issue?: string
  }>
}

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { issue } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  // Parse issue number from query parameter
  const issueNumber = issue ? Number(issue) : null
  const hasIssueFilter = issueNumber !== null && !isNaN(issueNumber) && issueNumber > 0

  // Build where clause
  const whereClause: any = {}
  if (hasIssueFilter) {
    whereClause.issueNumber = {
      equals: issueNumber,
    }
  }

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      issueNumber: true,
    },
    ...(Object.keys(whereClause).length > 0
      ? {
          where: whereClause,
        }
      : {}),
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{hasIssueFilter ? `Issue ${issueNumber} Posts` : 'Posts'}</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination
            page={posts.page}
            totalPages={posts.totalPages}
            basePath={hasIssueFilter ? `/posts?issue=${issueNumber}` : '/posts'}
          />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Posts`,
  }
}
