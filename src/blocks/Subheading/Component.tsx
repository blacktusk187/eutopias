import React from 'react'
import type { SubheadingBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'

type Props = SubheadingBlock & {
  className?: string
}

export const Subheading: React.FC<Props> = ({ text, level = 'h2', className }) => {
  const Tag = level as 'h2' | 'h3'
  return (
    <Tag
      className={cn(
        'mt-12 mb-6 font-semibold text-foreground',
        level === 'h2' && 'text-2xl md:text-3xl',
        level === 'h3' && 'text-xl md:text-2xl',
        className,
      )}
    >
      {text}
    </Tag>
  )
}
