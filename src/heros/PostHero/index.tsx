import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'

import type { Post } from '@/payload-types'
import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'

export const PostHero: React.FC<{ post: Post }> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  return (
    <div className="relative -mt-[10.4rem] min-h-[70vh] md:min-h-[80vh] flex items-center justify-center text-white">
      {/* Background image (absolute) */}
      {heroImage && typeof heroImage === 'object' && (
        <div className="absolute inset-0 z-0">
          <Media
            resource={heroImage}
            fill
            priority
            pictureClassName="absolute inset-0"
            imgClassName="object-cover object-center"
          />
        </div>
      )}

      {/* Bottom gradient for text legibility */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Foreground content, centered */}
      <div className="container relative z-10 flex items-center justify-center">
        <div className="max-w-[48rem] text-center">
          <div className="uppercase text-sm mb-6">
            {categories?.map((category, index) => {
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
          </div>

          <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>

          <div className="flex flex-col md:flex-row gap-4 md:gap-16 justify-center">
            {hasAuthors && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm">Author</p>
                  <p>{formatAuthors(populatedAuthors)}</p>
                </div>
              </div>
            )}
            {publishedAt && (
              <div className="flex flex-col gap-1">
                <p className="text-sm">Date Published</p>
                <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
