'use client'

import { useEffect } from 'react'

type ArticleViewTrackerProps = {
  slug: string
}

export const ArticleViewTracker: React.FC<ArticleViewTrackerProps> = ({ slug }) => {
  useEffect(() => {
    const incrementViews = async () => {
      if (!slug) {
        console.error('ArticleViewTracker: No slug provided')
        return
      }

      try {
        const url = `/api/articles/${slug}/view`

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: 'Failed to parse error response' }))
          console.error('ArticleViewTracker: Error response:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          })
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error('Failed to increment views')
        }
      } catch (error) {
        console.error('ArticleViewTracker: Error incrementing article views:', error)
      }
    }

    incrementViews()
  }, [slug])

  return null
}
