import React from 'react'
import type { RelatedContentBlock } from '@/payload-types'
import { Card } from '@/components/Card'

type Props = RelatedContentBlock & {
  className?: string
}

export const RelatedContent: React.FC<Props> = ({ title = 'You may also like', posts }) => {
  const items = (posts || []).filter((p) => typeof p === 'object')

  if (!items.length) return null

  return (
    <section className="mt-16">
      {title && <h3 className="text-xl font-semibold mb-6">{title}</h3>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((doc, i) => (
          <Card key={i} doc={doc} relationTo="posts" showCategories />
        ))}
      </div>
    </section>
  )
}
