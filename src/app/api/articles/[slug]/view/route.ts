import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { Post } from '@/payload-types'

type RouteContext = {
  params: Promise<{
    slug: string
  }>
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { slug } = await context.params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Find the specific article
    const article = await payload.find({
      collection: 'posts',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    })

    if (!article.docs.length) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const currentArticle = article.docs[0] as Post
    const currentViews = typeof currentArticle.views === 'number' ? currentArticle.views : 0

    // Update the view count
    await payload.update({
      collection: 'posts',
      id: currentArticle.id,
      data: {
        views: currentViews + 1,
      },
    })

    return NextResponse.json({
      success: true,
      views: currentViews + 1,
    })
  } catch (error) {
    console.error('API: Error:', error)
    return NextResponse.json({ error: 'Failed to increment article views' }, { status: 500 })
  }
}
