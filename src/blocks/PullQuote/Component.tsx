import React from 'react'
import RichText from '@/components/RichText'
import type { PullQuoteBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'

type Props = PullQuoteBlock & {
  className?: string
}

export const PullQuote: React.FC<Props> = (props) => {
  const { quote, attribution, align = 'center', className } = props

  return (
    <figure
      className={cn(
        'my-10 py-8 border-y border-border',
        align === 'left' && 'text-left',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className,
      )}
    >
      <blockquote className="mx-auto max-w-3xl">
        <div className="text-2xl md:text-3xl font-semibold leading-snug text-foreground">
          <RichText data={quote} enableGutter={false} />
        </div>
      </blockquote>
      {attribution && (
        <figcaption className="mt-4 text-sm text-foreground/70">— {attribution}</figcaption>
      )}
    </figure>
  )
}
