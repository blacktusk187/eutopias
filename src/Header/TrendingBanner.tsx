'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiTrendingUp } from 'react-icons/fi'
import { Post } from '@/payload-types'

export const TrendingBanner: React.FC = () => {
  const [trendingArticles, setTrendingArticles] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrendingArticles = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/articles/popular', {
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(10000), // 10 second timeout
        })
        if (!response.ok) {
          throw new Error(`Failed to fetch trending articles: ${response.status}`)
        }
        const data = await response.json()
        console.log('Trending articles data:', data)
        if (Array.isArray(data) && data.length > 0) {
          setTrendingArticles(data.slice(0, 5))
        } else {
          console.warn('No trending articles found or invalid data format')
          setTrendingArticles([])
        }
      } catch (error) {
        console.error('Error fetching trending articles:', error)
        setError('Failed to load trending articles')
        // Don't block the page if trending articles fail to load
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingArticles()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-card py-1 md:py-2 border-t border-b border-border trending-banner-shadow">
        <div className="container">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium shrink-0">
              <FiTrendingUp className="w-4 h-4 text-card-foreground" />
              <span className="text-card-foreground hidden md:inline">TRENDING</span>
            </div>
            <div className="text-sm text-muted-foreground leading-tight">
              Loading trending articles...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !trendingArticles.length) {
    return null
  }

  return (
    <div className="bg-card py-1 md:py-2 border-t border-b border-border trending-banner-shadow">
      <div className="container">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium shrink-0">
            <FiTrendingUp className="w-4 h-4 text-card-foreground" />
            <span className="text-card-foreground hidden md:inline">TRENDING</span>
          </div>
          <div className="trending-scroll-container flex-1">
            <div className="trending-scroll-content">
              {/* First set of articles */}
              {trendingArticles.map((article, index) => (
                <React.Fragment key={article.id}>
                  <Link
                    href={`/posts/${article.slug}`}
                    className="text-sm text-card-foreground hover:text-accent-foreground transition-colors shrink-0 whitespace-nowrap leading-tight"
                  >
                    {article.title}
                  </Link>
                  {index < trendingArticles.length - 1 && (
                    <span className="text-muted-foreground hidden md:inline shrink-0 leading-tight">
                      •
                    </span>
                  )}
                </React.Fragment>
              ))}
              {/* Duplicate articles for seamless loop */}
              {trendingArticles.map((article, index) => (
                <React.Fragment key={`duplicate-${article.id}`}>
                  <Link
                    href={`/posts/${article.slug}`}
                    className="text-sm text-card-foreground hover:text-accent-foreground transition-colors shrink-0 whitespace-nowrap leading-tight"
                  >
                    {article.title}
                  </Link>
                  {index < trendingArticles.length - 1 && (
                    <span className="text-muted-foreground hidden md:inline shrink-0 leading-tight">
                      •
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
