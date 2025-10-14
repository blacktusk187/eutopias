import React from 'react'
import { formatDateTime } from '@/utilities/formatDateTime'
import { formatAuthors } from '@/utilities/formatAuthors'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import type { Post, Media as MediaType } from '@/payload-types'
import { calculateReadingTimeFromRichText } from '@/utilities/readingTime'
import { SocialShare } from '@/components/ui/SocialShare'

interface ArticleLayoutProps {
  post: Post
}

export const ArticleLayout: React.FC<ArticleLayoutProps> = ({ post }) => {
  const {
    categories,
    heroImage,
    populatedAuthors,
    publishedAt,
    title,
    deck,
    content,
    relatedPosts,
    tags,
  } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  const readingStats = content ? calculateReadingTimeFromRichText(content as any) : null

  // Generate breadcrumbs
  const breadcrumbItems = [{ label: 'Posts', href: '/posts' }]

  // Add category breadcrumb if available
  if (categories && categories.length > 0) {
    const category = categories[0]
    if (typeof category === 'object' && category.title) {
      breadcrumbItems.push({
        label: category.title,
        href: `/posts/category/${category.slug}`,
      })
    }
  }

  // Add current article (no href for current page)
  breadcrumbItems.push({ label: title })

  return (
    <article className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="py-16 bg-background">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            {/* Hero Image */}
            {heroImage && typeof heroImage === 'object' && (
              <div className="mb-6">
                <Media
                  resource={heroImage}
                  priority
                  pictureClassName="block"
                  imgClassName="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Caption and Attribution */}
            {heroImage && typeof heroImage === 'object' && heroImage.caption && (
              <div className="mb-6">
                <div className="flex items-start gap-3">
                  {/* Small colored vertical divider */}
                  <div className="w-1 h-16 bg-eutopias-gold mt-1 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="hero-caption">
                      <RichText
                        data={heroImage.caption}
                        enableGutter={false}
                        className="prose prose-sm max-w-none"
                      />
                    </div>
                    {heroImage.alt && (
                      <p className="text-sm text-foreground/70 font-medium">{heroImage.alt}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Category Badge */}
            {categories && categories.length > 0 && (
              <div className="mb-8">
                <span className="inline-block px-4 py-2 bg-foreground/10 text-foreground/80 text-sm font-medium uppercase tracking-wide rounded-full">
                  {categories.map((category, index) => {
                    if (typeof category === 'object' && category !== null) {
                      const titleToUse = category.title || 'Untitled category'
                      const isLast = index === categories.length - 1
                      return (
                        <React.Fragment key={index}>
                          {titleToUse}
                          {!isLast && <React.Fragment>, &nbsp;</React.Fragment>}
                        </React.Fragment>
                      )
                    }
                    return null
                  })}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-foreground">
              {title}
            </h1>

            {/* Deck / Subhead */}
            {deck && (
              <div className="mb-8 text-xl md:text-2xl lg:text-3xl text-foreground/80">
                <RichText
                  data={deck as any}
                  enableGutter={false}
                  className="prose-xl md:prose-2xl"
                />
              </div>
            )}

            {/* Author, Date, Reading Time, Share */}
            {/* Mobile layout */}
            <div className="md:hidden">
              <div className="text-sm text-foreground/80 flex flex-wrap items-center gap-x-2 gap-y-1">
                {hasAuthors && (
                  <>
                    <span className="text-foreground/70">By</span>
                    <span className="font-medium text-foreground">
                      {formatAuthors(populatedAuthors)}
                    </span>
                  </>
                )}
                {publishedAt && (
                  <>
                    <span className="text-foreground/50">•</span>
                    <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
                  </>
                )}
                {readingStats && (
                  <>
                    <span className="text-foreground/50">•</span>
                    <span>{readingStats.minutes} min read</span>
                  </>
                )}
              </div>
              <div className="mt-3 flex items-center">
                <span className="text-sm text-foreground/70 mr-3">Share</span>
                <SocialShare urlPath={`/posts/${post.slug}`} title={title} />
              </div>
            </div>

            {/* Desktop/tablet layout */}
            <div className="hidden md:flex flex-row gap-12 text-lg items-center">
              {hasAuthors && (
                <div className="flex flex-col">
                  <span className="text-sm text-foreground/70 mb-1">By</span>
                  <span className="font-medium text-foreground">
                    {formatAuthors(populatedAuthors)}
                  </span>
                </div>
              )}
              {publishedAt && (
                <div className="flex flex-col">
                  <span className="text-sm text-foreground/70 mb-1">Published</span>
                  <time dateTime={publishedAt} className="font-medium text-foreground">
                    {formatDateTime(publishedAt)}
                  </time>
                </div>
              )}
              {readingStats && (
                <div className="flex flex-col">
                  <span className="text-sm text-foreground/70 mb-1">Reading time</span>
                  <span className="font-medium text-foreground">{readingStats.minutes} min</span>
                </div>
              )}
              <div className="ml-auto">
                <SocialShare urlPath={`/posts/${post.slug}`} title={title} />
              </div>
            </div>
            <div className="mt-6 h-px bg-border" />
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-background">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto py-4">
            <Breadcrumbs items={breadcrumbItems} />
            <div className="h-px bg-border mt-4" />
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="pb-16 bg-background">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            {/* Article Body */}
            <div className="prose prose-lg max-w-none">
              <RichText data={content} enableGutter={false} className="article-content" />
            </div>

            {/* Related Posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <div className="mt-16 pt-16 border-t border-border">
                <h2 className="text-2xl font-bold mb-8 text-foreground">Related Articles</h2>
                <RelatedPosts
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  docs={relatedPosts.filter((post) => typeof post === 'object')}
                />
              </div>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="mt-16 pt-6 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => {
                    if (typeof tag === 'object' && tag !== null) {
                      const titleToUse = tag.title || 'Untitled tag'
                      return (
                        <span
                          key={index}
                          className="inline-block px-3 py-1 rounded-full bg-foreground/10 text-foreground/80 text-sm"
                        >
                          {titleToUse}
                        </span>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
