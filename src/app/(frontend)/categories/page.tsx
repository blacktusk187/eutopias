import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import PageClient from './page.client'

export const revalidate = 600
export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  if (process.env.CI === '1') {
    return (
      <div className="pt-24 pb-24">
        <PageClient />
        <div className="container mb-8">
          <Breadcrumbs items={[{ label: 'Categories' }]} />
        </div>
        <div className="container">Build-time fetch disabled in CI.</div>
      </div>
    )
  }
  const payload = await getPayload({ config: configPromise })

  // Get all categories with their post counts
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: 'title',
  })

  // Get post counts for each category
  const categoriesWithCounts = await Promise.all(
    categories.docs.map(async (category) => {
      const posts = await payload.find({
        collection: 'posts',
        limit: 0,
        overrideAccess: false,
        where: {
          categories: {
            contains: category.id,
          },
        },
      })
      return {
        ...category,
        postCount: posts.totalDocs,
      }
    }),
  )

  // Separate parent and child categories
  const parentCategories = categoriesWithCounts.filter((cat) => !cat.parent)
  const childCategories = categoriesWithCounts.filter((cat) => cat.parent)

  // Group children by parent
  const childrenByParent = childCategories.reduce<Record<number, typeof childCategories>>(
    (acc, child) => {
      const parentId = typeof child.parent === 'object' ? child.parent?.id : child.parent
      if (parentId) {
        acc[parentId] = acc[parentId] || []
        acc[parentId].push(child)
      }
      return acc
    },
    {},
  )

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-8">
        <Breadcrumbs items={[{ label: 'Categories' }]} />
      </div>

      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Categories</h1>
          <p className="text-muted-foreground">Explore our content by category</p>
        </div>
      </div>

      <div className="container">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {parentCategories.map((category) => {
            const children = childrenByParent[category.id] || []
            return (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <Link
                      href={`/posts/category/${category.slug}`}
                      className="hover:text-accent-foreground transition-colors"
                    >
                      {category.title}
                    </Link>
                    <Badge variant="secondary">
                      {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                    </Badge>
                  </CardTitle>
                  {children.length > 0 && (
                    <CardDescription>
                      {children.length} subcategor{children.length === 1 ? 'y' : 'ies'}
                    </CardDescription>
                  )}
                </CardHeader>
                {children.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      {children.slice(0, 3).map((child) => (
                        <div key={child.id} className="flex items-center justify-between">
                          <Link
                            href={`/posts/category/${child.slug}`}
                            className="text-sm hover:text-accent-foreground transition-colors"
                          >
                            {child.title}
                          </Link>
                          <Badge variant="outline" className="text-xs">
                            {child.postCount}
                          </Badge>
                        </div>
                      ))}
                      {children.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{children.length - 3} more subcategor
                          {children.length - 3 === 1 ? 'y' : 'ies'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Categories - Eutopias',
    description: 'Explore our content by category',
  }
}
