import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
  layout?: 'single' | 'side-by-side-vertical' | 'side-by-side-horizontal'
}

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    media,
    staticImage,
    disableInnerContainer,
    variant = 'bordered',
    width = 'md',
    align = 'center',
    layout = 'single',
  } = props

  let caption
  if (media && typeof media === 'object') caption = media.caption

  const widthClasses =
    width === 'sm'
      ? 'max-w-[36rem]'
      : width === 'md'
        ? 'max-w-[48rem]'
        : width === 'lg'
          ? 'max-w-[64rem]'
          : width === 'xl'
            ? 'max-w-[80rem]'
            : 'max-w-none'

  const alignClasses =
    align === 'left' ? 'ml-0 mr-auto' : align === 'right' ? 'ml-auto mr-0' : 'mx-auto'

  const imageDecorationClasses =
    variant === 'shadowed'
      ? 'shadow-xl rounded-lg'
      : variant === 'frameless'
        ? 'rounded-lg'
        : 'border border-border rounded-lg'

  // Determine if we have multiple images
  const hasMultipleImages = media && (media || staticImage)

  // Layout classes for side-by-side images
  const getLayoutClasses = () => {
    if (!hasMultipleImages || layout === 'single') return ''

    if (layout === 'side-by-side-vertical') {
      return 'grid grid-cols-1 md:grid-cols-2 gap-4'
    }

    if (layout === 'side-by-side-horizontal') {
      return 'grid grid-cols-1 md:grid-cols-2 gap-4'
    }

    return ''
  }

  const renderSingleImage = () => (
    <Media
      imgClassName={cn(imageDecorationClasses, imgClassName)}
      resource={media}
      src={staticImage}
    />
  )

  const renderMultipleImages = () => {
    if (!hasMultipleImages) return renderSingleImage()

    return (
      <div className={getLayoutClasses()}>
        <Media
          imgClassName={cn(imageDecorationClasses, imgClassName)}
          resource={media}
          src={staticImage}
        />
        <Media imgClassName={cn(imageDecorationClasses, imgClassName)} resource={media} />
      </div>
    )
  }

  return (
    <div className={cn('', { container: enableGutter }, className)}>
      {(media || staticImage) && (
        <div className={cn(widthClasses, alignClasses)}>{renderMultipleImages()}</div>
      )}
      {caption && (
        <div
          className={cn(
            'mt-6',
            {
              container: !disableInnerContainer,
            },
            captionClassName,
          )}
        >
          <div className={cn(widthClasses, alignClasses)}>
            <RichText data={caption} enableGutter={false} />
          </div>
        </div>
      )}
    </div>
  )
}
