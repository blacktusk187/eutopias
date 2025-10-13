import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const MAX_LIMIT = 24

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limitParam = Number(url.searchParams.get('limit') ?? '5')
    const pageParam = Number(url.searchParams.get('page') ?? '1')
    const limit = Math.max(1, Math.min(Number.isNaN(limitParam) ? 5 : limitParam, MAX_LIMIT))
    const page = Math.max(1, Number.isNaN(pageParam) ? 1 : pageParam)
    const exclude = url.searchParams.getAll('exclude').filter(Boolean)

    const payload = await getPayload({ config: configPromise })

    const where: NonNullable<Parameters<typeof payload.find>[0]['where']> = {
      _status: { equals: 'published' },
    }

    if (exclude.length) {
      where.slug = { not_in: exclude }
    }

    const result = await payload.find({
      collection: 'posts',
      depth: 1,
      limit,
      page,
      sort: '-publishedAt',
      select: {
        id: true,
        slug: true,
        title: true,
        categories: true,
        meta: true,
      },
      where,
    })

    return NextResponse.json({
      docs: result.docs,
      hasNextPage: result.hasNextPage,
      page: result.page,
      totalPages: result.totalPages,
    })
  } catch (error) {
    console.error('Error fetching latest articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch latest articles' },
      { status: 500 },
    )
  }
}
