import React from 'react'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import { Media } from '@/components/Media'
import { Post } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'

interface CategoryFeaturedSectionProps {
  posts: Post[]
  sidebarPosts?: Post[] // Optional sidebar posts from other categories
}

// Normalize a post's image (meta.image → heroImage) as object or string URL
const getPostImage = (post: Post): { resource?: any; src?: string } | null => {
  const img: unknown = (post as any)?.meta?.image ?? (post as any)?.heroImage ?? null
  if (!img) return null
  if (typeof img === 'object') return { resource: img }
  if (typeof img === 'string' && img.trim()) return { src: getMediaUrl(img) }
  return null
}

export const CategoryFeaturedSection: React.FC<CategoryFeaturedSectionProps> = ({
  posts,
  sidebarPosts = [],
}) => {
  const getCategoryTitle = (post: Post): string => {
    if (post.categories && post.categories.length > 0) {
      const category = post.categories[0]
      return typeof category === 'object' ? category.title : 'Uncategorized'
    }
    return 'Uncategorized'
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="container">
        <div className="text-center py-16">
          <p className="text-muted-foreground">No posts found in this category.</p>
        </div>
      </div>
    )
  }

  const featuredMain = posts[0]
  const featuredSub1 = posts[1]
  const featuredSub2 = posts[2]

  return (
    <div className="container mb-20 mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Posts - Left Column (1/3) */}
        {sidebarPosts.length > 0 && (
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className="h-full flex flex-col">
              <div className="flex-1 space-y-6">
                {sidebarPosts.map((article) => {
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
            </div>
          </div>
        )}

        {/* Featured Articles - Right Column (2/3) */}
        <div
          className={`${sidebarPosts.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} order-1 lg:order-2`}
        >
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
                            <FiArrowRight className="w-4 h-4" />
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
