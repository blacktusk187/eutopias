import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Media } from '@/components/Media'
import { Post } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'

interface LatestStoriesSectionProps {
  todaysPicks: Post[]
  featuredMain?: Post | null
  featuredSub1?: Post | null
  featuredSub2?: Post | null
}

// Normalize a post's image (meta.image → heroImage) as object or string URL
const getPostImage = (post: Post): { resource?: any; src?: string } | null => {
  const img: unknown = (post as any)?.meta?.image ?? (post as any)?.heroImage ?? null
  if (!img) return null
  if (typeof img === 'object') return { resource: img }
  if (typeof img === 'string' && img.trim()) return { src: getMediaUrl(img) }
  return null
}

export const LatestStoriesSection: React.FC<LatestStoriesSectionProps> = ({
  todaysPicks,
  featuredMain,
  featuredSub1,
  featuredSub2,
}) => {
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
              {todaysPicks.map((article) => {
                const category = getCategoryTitle(article)
                const img = getPostImage(article)

                return (
                  <Link key={article.id} href={`/posts/${article.slug}`} className="block group">
                    <div className="flex gap-4 hover:bg-accent/50 p-2 rounded transition-colors">
                      <div className="w-16 h-16 flex-shrink-0">
                        {img ? (
                          <div className="relative w-full h-full overflow-hidden rounded">
                            {img.resource ? (
                              <Media
                                resource={img.resource}
                                fill
                                pictureClassName="absolute inset-0"
                                imgClassName="object-cover"
                              />
                            ) : (
                              <Media
                                src={img.src as string}
                                fill
                                pictureClassName="absolute inset-0"
                                imgClassName="object-cover"
                              />
                            )}
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
            <div className="mt-6">
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
                  {(() => {
                    const img = getPostImage(featuredMain)
                    if (!img) {
                      return (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )
                    }
                    return (
                      <>
                        {img.resource ? (
                          <Media
                            resource={img.resource}
                            fill
                            pictureClassName="absolute inset-0"
                            imgClassName="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Media
                            src={img.src as string}
                            fill
                            pictureClassName="absolute inset-0"
                            imgClassName="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
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
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Grid of Additional Featured Articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[featuredSub1, featuredSub2].map((article) => {
                if (!article) return null
                const category = getCategoryTitle(article)
                const img = getPostImage(article)

                return (
                  <Link key={article.id} href={`/posts/${article.slug}`} className="group">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4">
                      {img ? (
                        <>
                          {img.resource ? (
                            <Media
                              resource={img.resource}
                              fill
                              pictureClassName="absolute inset-0"
                              imgClassName="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Media
                              src={img.src as string}
                              fill
                              pictureClassName="absolute inset-0"
                              imgClassName="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
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
