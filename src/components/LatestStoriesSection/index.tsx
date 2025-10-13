'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Media } from '@/components/Media'
import { Post } from '@/payload-types'

interface LatestStoriesSectionProps {
  todaysPicks: Post[]
  featuredMain?: Post | null
  featuredSub1?: Post | null
  featuredSub2?: Post | null
}

const INITIAL_VISIBLE_PICKS = 5
const PICK_INCREMENT = 5
const FETCH_TIMEOUT_MS = 10000

interface LatestArticlesResponse {
  docs: Post[]
  hasNextPage: boolean
  page: number
  totalPages: number
}

export const LatestStoriesSection: React.FC<LatestStoriesSectionProps> = ({
  todaysPicks,
  featuredMain,
  featuredSub1,
  featuredSub2,
}) => {
  const [articles, setArticles] = React.useState<Post[]>(todaysPicks)
  const [visibleCount, setVisibleCount] = React.useState(() =>
    Math.min(INITIAL_VISIBLE_PICKS, todaysPicks.length),
  )
  const [nextPage, setNextPage] = React.useState(1)
  const [isFetchingMore, setIsFetchingMore] = React.useState(false)
  const [hasMoreFromApi, setHasMoreFromApi] = React.useState(true)
  const [fetchError, setFetchError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setArticles(todaysPicks)
    setVisibleCount(Math.min(INITIAL_VISIBLE_PICKS, todaysPicks.length))
    setNextPage(1)
    setHasMoreFromApi(true)
    setFetchError(null)
  }, [todaysPicks])

  React.useEffect(() => {
    setVisibleCount((current) =>
      Math.min(Math.max(INITIAL_VISIBLE_PICKS, current), articles.length),
    )
  }, [articles.length])

  const displayedPicks = React.useMemo(
    () => articles.slice(0, visibleCount),
    [articles, visibleCount],
  )

  const canShowMore = visibleCount < articles.length || hasMoreFromApi

  const handleShowMore = React.useCallback(async () => {
    if (visibleCount < articles.length) {
      setVisibleCount((current) =>
        Math.min(current + PICK_INCREMENT, articles.length),
      )
      return
    }

    if (!hasMoreFromApi || isFetchingMore) {
      return
    }

    const params = new URLSearchParams({
      limit: String(PICK_INCREMENT),
      page: String(nextPage),
    })

    const excludeSlugs = Array.from(
      new Set(
        articles
          .map((article) => article.slug)
          .filter((slug): slug is string => Boolean(slug)),
      ),
    )

    excludeSlugs.forEach((slug) => params.append('exclude', slug))

    try {
      setIsFetchingMore(true)
      setFetchError(null)

      const response = await fetch(`/api/articles/latest?${params.toString()}`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch more articles: ${response.status}`)
      }

      const data = (await response.json()) as LatestArticlesResponse

      setArticles((currentArticles) => {
        const existingIds = new Set(currentArticles.map((article) => article.id))
        const dedupedNewArticles = data.docs.filter(
          (article) => article && !existingIds.has(article.id),
        )

        if (!dedupedNewArticles.length) {
          return currentArticles
        }

        const updatedArticles = [...currentArticles, ...dedupedNewArticles]

        setVisibleCount((current) =>
          Math.min(current + PICK_INCREMENT, updatedArticles.length),
        )

        return updatedArticles
      })

      setHasMoreFromApi(data.hasNextPage)
      setNextPage((current) => current + 1)
    } catch (error) {
      console.error('Error loading additional latest articles:', error)
      setFetchError('Unable to load more articles right now. Please try again soon.')
    } finally {
      setIsFetchingMore(false)
    }
  }, [
    articles,
    hasMoreFromApi,
    isFetchingMore,
    nextPage,
    visibleCount,
  ])

  const getCategoryTitle = (post: Post): string => {
    if (post.categories && post.categories.length > 0) {
      const category = post.categories[0]
      return typeof category === 'object' ? category.title : 'Uncategorized'
    }
    return 'Uncategorized'
  }

  return (
    <div className="container mb-20 mt-16">
      {/* Latest Stories Heading */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-[#003366] mb-4">LATEST STORIES</h2>
        <div className="w-16 h-0.5 bg-[#003366] mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Today's Picks - Left Column (1/3) */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="h-full flex flex-col">
            <h3 className="text-2xl font-bold mb-6 text-foreground">TODAY&apos;S PICKS</h3>
            <div className="flex-1 space-y-6">
              {displayedPicks.map((article) => {
                const category = getCategoryTitle(article)

                return (
                  <Link key={article.id} href={`/posts/${article.slug}`} className="block group">
                    <div className="flex gap-4 hover:bg-accent/50 p-2 rounded transition-colors">
                      <div className="w-16 h-16 flex-shrink-0">
                        {article.meta?.image && typeof article.meta.image === 'object' ? (
                          <div className="relative w-full h-full overflow-hidden rounded">
                            <Media
                              resource={article.meta.image}
                              fill
                              className="object-cover"
                              imgClassName="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-muted rounded" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {category}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-foreground leading-tight line-clamp-3 group-hover:text-accent-foreground transition-colors">
                          {article.title}
                        </h4>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            <div className="mt-6 flex flex-col gap-2">
              {canShowMore && (
                <button
                  type="button"
                  onClick={handleShowMore}
                  disabled={isFetchingMore}
                  className="text-sm font-medium text-foreground hover:text-accent-foreground transition-colors underline text-left disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isFetchingMore ? 'Loading more articles…' : 'Show More Articles'}
                </button>
              )}
              {fetchError && (
                <p className="text-sm text-destructive" role="status">
                  {fetchError}
                </p>
              )}
              <Link
                href="/posts"
                className="text-sm font-medium text-foreground hover:text-accent-foreground transition-colors underline"
              >
                View All Articles
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Articles - Right Column (2/3) */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="space-y-6">
            {/* Main Featured Article */}
            {featuredMain && (
              <div className="relative group">
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                  {featuredMain.meta?.image && typeof featuredMain.meta.image === 'object' ? (
                    <>
                      <Media
                        resource={featuredMain.meta.image}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        imgClassName="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-white">
                            {getCategoryTitle(featuredMain)}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                          {featuredMain.title}
                        </h3>
                        <Link
                          href={`/posts/${featuredMain.slug}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-[#EEBC2A] transition-colors"
                        >
                          Read More
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Grid of Additional Featured Articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[featuredSub1, featuredSub2].map((article) => {
                if (!article) return null

                const category = getCategoryTitle(article)

                return (
                  <Link key={article.id} href={`/posts/${article.slug}`} className="group">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4">
                      {article.meta?.image && typeof article.meta.image === 'object' ? (
                        <>
                          <Media
                            resource={article.meta.image}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            imgClassName="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
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
                      <h4 className="text-lg font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-accent-foreground transition-colors">
                        {article.title}
                      </h4>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
