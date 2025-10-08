import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    // Try to get popular articles by views, fallback to recent articles
    let result
    try {
      result = await payload.find({
        collection: 'posts',
        limit: 5,
        sort: '-views', // Sort by views count in descending order
        depth: 1,
        where: {
          _status: {
            equals: 'published',
          },
        },
      })
    } catch (sortError) {
      console.warn('Failed to sort by views, falling back to recent articles:', sortError)
      // Fallback to recent articles if views sorting fails
      result = await payload.find({
        collection: 'posts',
        limit: 5,
        sort: '-createdAt', // Sort by creation date in descending order
        depth: 1,
        where: {
          _status: {
            equals: 'published',
          },
        },
      })
    }

    if (!result.docs || result.docs.length === 0) {
      return NextResponse.json([])
    }

    return NextResponse.json(result.docs)
  } catch (error) {
    console.error('Error fetching popular articles:', error)
    return NextResponse.json({ error: 'Failed to fetch popular articles' }, { status: 500 })
  }
}
