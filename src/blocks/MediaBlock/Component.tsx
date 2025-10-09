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
      ? 'shadow-xl rounded-[0.8rem]'
      : variant === 'frameless'
        ? ''
        : 'border border-border rounded-[0.8rem]'

  return (
    <div className={cn('', { container: enableGutter }, className)}>
      {(media || staticImage) && (
        <div className={cn(widthClasses, alignClasses)}>
          <Media
            imgClassName={cn(imageDecorationClasses, imgClassName)}
            resource={media}
            src={staticImage}
          />
        </div>
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
