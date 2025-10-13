import Image from 'next/image'
import React from 'react'

import type { Config, Media } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { getMediaUrl } from '@/utilities/getMediaUrl'

interface CategoryBannerProps {
  title: string
  backgroundImage?: Media | Config['db']['defaultIDType'] | string | null
  className?: string
}

const getCacheTag = (media: CategoryBannerProps['backgroundImage']): string | undefined => {
  if (typeof media === 'object' && media && 'updatedAt' in media) {
    const updatedAt = media.updatedAt
    return typeof updatedAt === 'string' && updatedAt.trim() ? updatedAt : undefined
  }

  return undefined
}

export const CategoryBanner: React.FC<CategoryBannerProps> = ({
  title,
  backgroundImage,
  className,
}) => {
  const imageUrl = getMediaUrl(backgroundImage)
  const imageAlt =
    typeof backgroundImage === 'object' && backgroundImage && 'alt' in backgroundImage
      ? backgroundImage.alt || `${title} category background`
      : `${title} category background`

  return (
    <div
      className={cn(
        'relative flex h-48 w-full items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat md:h-64',
        !imageUrl && 'bg-gradient-to-br from-eutopias-blue to-eutopias-gold',
        className,
      )}
    >
      {imageUrl ? (
        <Image
          alt={imageAlt}
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src={imageUrl}
        />
      ) : null}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div className="relative z-10 text-center">
        <h1 className="font-cera text-4xl font-bold uppercase tracking-wide text-white md:text-6xl">{title}</h1>
      </div>
    </div>
  )
}
