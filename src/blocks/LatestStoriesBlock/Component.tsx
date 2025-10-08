import type { Post, LatestStoriesBlock as LatestStoriesBlockProps } from '@/payload-types'
import React from 'react'
import { LatestStoriesSection } from '@/components/LatestStoriesSection'

export const LatestStoriesBlock: React.FC<
  LatestStoriesBlockProps & {
    id?: string
  }
> = (props) => {
  const { todaysPicks, featuredMain, featuredSub1, featuredSub2 } = props

  // Convert the relationship data to Post objects
  const todaysPicksPosts = (todaysPicks || [])
    .map((pick) => (typeof pick === 'object' ? pick : null))
    .filter((pick): pick is Post => pick !== null)

  const featuredMainPost = typeof featuredMain === 'object' ? featuredMain : null
  const featuredSub1Post = typeof featuredSub1 === 'object' ? featuredSub1 : null
  const featuredSub2Post = typeof featuredSub2 === 'object' ? featuredSub2 : null

  return (
    <LatestStoriesSection
      todaysPicks={todaysPicksPosts}
      featuredMain={featuredMainPost}
      featuredSub1={featuredSub1Post}
      featuredSub2={featuredSub2Post}
    />
  )
}
