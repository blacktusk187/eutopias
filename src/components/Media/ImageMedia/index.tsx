'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'

import type { MediaSizeKey, Props as MediaProps } from '../types'

import type { Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'

const PAYLOAD_SIZE_ORDER: MediaSizeKey[] = [
  'thumbnail',
  'square',
  'small',
  'medium',
  'large',
  'xlarge',
  'og',
]

const buildSrcSet = (resource: Media, cacheTag?: string | null): string | undefined => {
  const entries: string[] = []

  for (const key of PAYLOAD_SIZE_ORDER) {
    const sized = resource.sizes?.[key]
    if (sized?.url && sized.width) {
      entries.push(`${getMediaUrl(sized.url, cacheTag)} ${sized.width}w`)
    }
  }

  if (resource.url && resource.width) {
    const fullUrl = getMediaUrl(resource.url, cacheTag)
    const alreadyIncluded = entries.some((entry) => entry.startsWith(`${fullUrl} `))
    if (!alreadyIncluded) {
      entries.push(`${fullUrl} ${resource.width}w`)
    }
  }

  return entries.length > 0 ? entries.join(', ') : undefined
}

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    pictureClassName,
    imgClassName,
    priority,
    mediaSize,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    loading: loadingFromProps,
  } = props

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''
  let srcSet: string | undefined

  if (!src && resource && typeof resource === 'object') {
    const { alt: altFromResource, height: fullHeight, width: fullWidth } = resource

    width = fullWidth ?? undefined
    height = fullHeight ?? undefined
    alt = altFromResource || ''

    const cacheTag = resource.updatedAt

    src = getMediaUrl(resource, { size: mediaSize, cacheTag })
    srcSet = buildSrcSet(resource, cacheTag)
  }

  if (typeof src !== 'string') {
    src = typeof src === 'object' && src ? src.src : ''
  }

  const loading = loadingFromProps || (priority ? 'eager' : 'lazy')

  const sizes = sizeFromProps
    ? sizeFromProps
    : fill
      ? '100vw'
      : '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px'

  return (
    <picture className={cn(pictureClassName, fill && 'relative block h-full w-full')}>
      <img
        src={src}
        alt={alt || ''}
        className={cn(imgClassName, fill && 'absolute inset-0 h-full w-full object-cover')}
        loading={loading}
        sizes={srcSet ? sizes : undefined}
        srcSet={srcSet}
        {...(width != null && height != null && !fill ? { width, height } : {})}
      />
    </picture>
  )
}
