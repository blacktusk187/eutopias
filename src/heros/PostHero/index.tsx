import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'
import { FiShare2, FiTwitter, FiFacebook, FiLinkedin } from 'react-icons/fi'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  return (
    <div className="container py-8">
      <div className="max-w-[48rem] mx-auto">
        {/* Hero Image - contained to article width */}
        {heroImage && typeof heroImage !== 'string' && (
          <div className="mb-8">
            <Media resource={heroImage} priority imgClassName="w-full h-auto rounded-lg" />
          </div>
        )}

        {/* Category */}
        <div className="uppercase text-sm text-gray-600 mb-4">
          {categories?.map((category, index) => {
            if (typeof category === 'object' && category !== null) {
              const { title: categoryTitle } = category
              const titleToUse = categoryTitle || 'Untitled category'
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

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">{title}</h1>

        {/* Author Info with Social Sharing */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            {hasAuthors && (
              <div className="flex items-center gap-2">
                <span className="font-medium">By</span>
                <span>{formatAuthors(populatedAuthors)}</span>
              </div>
            )}
            {publishedAt && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Published</span>
                <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-medium">Reading time</span>
              <span>2 min</span>
            </div>
          </div>

          {/* Social Sharing Icons */}
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
              <FiShare2 className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
              <FiTwitter className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
              <FiFacebook className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
              <FiLinkedin className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Line Divider */}
        <div className="border-t border-gray-200 mb-6"></div>
      </div>
    </div>
  )
}
