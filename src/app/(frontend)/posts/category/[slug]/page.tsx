import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { cache } from 'react'
import { notFound } from 'next/navigation'

import { CategoryFeaturedSection } from '@/components/CategoryFeaturedSection'
import { Pagination } from '@/components/Pagination'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CategoryBanner } from '@/components/CategoryBanner'
import PageClient from './page.client'

export const revalidate = 600

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'categories',
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return categories.docs.map(({ slug }) => ({
    slug,
  }))
}

type Args = {
  params: Promise<{
    slug: string
  }>
}

export default async function CategoryPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  // First, get the category to verify it exists
  const category = await queryCategoryBySlug({ slug })

  if (!category) {
    notFound()
  }

  // Get posts for this category
  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    where: {
      categories: {
        contains: category.id,
      },
    },
  })

  // Get additional posts from the same category for sidebar
  const sidebarPosts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 8,
    overrideAccess: false,
    where: {
      categories: {
        contains: category.id,
      },
    },
  })

  return (
    <div className="pb-24">
      <PageClient />
      <CategoryBanner title={category.title} backgroundImage={category.bannerImage} />
      <div className="container mb-8 mt-4">
        <Breadcrumbs items={[{ label: 'Posts', href: '/posts' }, { label: category.title }]} />
      </div>

      <CategoryFeaturedSection posts={posts.docs} sidebarPosts={sidebarPosts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination
            page={posts.page}
            totalPages={posts.totalPages}
            basePath={`/posts/category/${category.slug}`}
          />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const category = await queryCategoryBySlug({ slug })

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.title} - Eutopias`,
    description: `Posts in the ${category.title} category`,
  }
}

const queryCategoryBySlug = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'categories',
    limit: 1,
    overrideAccess: false,
    pagination: false,
    depth: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      bannerImage: true,
      parent: true,
      breadcrumbs: true,
      updatedAt: true,
      createdAt: true,
    },
  })

  return result.docs?.[0] || null
})
