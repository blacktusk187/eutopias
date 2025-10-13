'use client'

import React from 'react'
import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'
import { Media } from '@/components/Media'
import { Post } from '@/payload-types'

interface LatestStoriesSectionProps {
  todaysPicks: Post[]
  featuredMain?: Post | null
  featuredSub1?: Post | null
  featuredSub2?: Post | null
}

export const LatestStoriesSection: React.FC<LatestStoriesSectionProps> = ({
  todaysPicks,
  featuredMain,
  featuredSub1,
  featuredSub2,
}) => {
  const [visibleCount, setVisibleCount] = React.useState(todaysPicks.length)
  const [measurementSignal, setMeasurementSignal] = React.useState(0)
  const headingRef = React.useRef<HTMLDivElement | null>(null)
  const footerRef = React.useRef<HTMLDivElement | null>(null)
  const listRef = React.useRef<HTMLDivElement | null>(null)
  const featuredColumnRef = React.useRef<HTMLDivElement | null>(null)

  const displayedPicks = React.useMemo(
    () => todaysPicks.slice(0, visibleCount),
    [todaysPicks, visibleCount],
  )

  React.useEffect(() => {
    setVisibleCount(todaysPicks.length)
    setMeasurementSignal((signal) => signal + 1)
  }, [todaysPicks])

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleResize = () => {
      setVisibleCount(todaysPicks.length)
      setMeasurementSignal((signal) => signal + 1)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [todaysPicks.length])

  React.useEffect(() => {
    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const target = featuredColumnRef.current

    if (!target) {
      return
    }

    const observer = new ResizeObserver(() => {
      setVisibleCount(todaysPicks.length)
      setMeasurementSignal((signal) => signal + 1)
    })

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [todaysPicks.length])

  React.useLayoutEffect(() => {
    const featuredHeight = featuredColumnRef.current?.offsetHeight ?? 0
    const headingHeight = headingRef.current?.offsetHeight ?? 0
    const footerHeight = footerRef.current?.offsetHeight ?? 0
    const availableHeight = featuredHeight - headingHeight - footerHeight

    const listElement = listRef.current

    if (!listElement) {
      return
    }

    const items = Array.from(listElement.children) as HTMLElement[]

    if (!items.length) {
      if (visibleCount !== 0) {
        setVisibleCount(0)
      }
      return
    }

    if (availableHeight <= 0) {
      if (visibleCount !== Math.min(1, items.length)) {
        setVisibleCount(Math.min(1, items.length))
      }
      return
    }

    let totalHeight = 0
    let nextCount = 0

    for (const item of items) {
      const itemHeight = item.offsetHeight

      if (itemHeight === 0) {
        continue
      }

      if (nextCount > 0 && totalHeight + itemHeight > availableHeight) {
        break
      }

      totalHeight += itemHeight
      nextCount += 1

      if (totalHeight >= availableHeight) {
        break
      }
    }

    if (nextCount === 0) {
      nextCount = Math.min(1, items.length)
    }

    if (nextCount !== visibleCount) {
      setVisibleCount(nextCount)
    }
  }, [measurementSignal, todaysPicks.length, visibleCount])

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
            <div ref={headingRef}>
              <h3 className="text-2xl font-bold mb-6 text-foreground">TODAY&apos;S PICKS</h3>
            </div>
            <div ref={listRef} className="flex-1 space-y-6 overflow-hidden">
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
            <div ref={footerRef} className="mt-6 flex flex-col gap-2">
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
        <div className="lg:col-span-8 order-1 lg:order-2" ref={featuredColumnRef}>
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
                          <FaArrowRight className="w-4 h-4" />
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
