import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Media as MediaType } from '@/payload-types'

export type MediaSizeKey = keyof NonNullable<MediaType['sizes']>

export interface Props {
  alt?: string
  className?: string
  fill?: boolean
  htmlElement?: ElementType | null
  pictureClassName?: string
  imgClassName?: string
  onClick?: () => void
  onLoad?: () => void
  loading?: 'lazy' | 'eager'
  priority?: boolean
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>
  /** Preferred Payload-generated size variant (e.g. thumbnail, small, large) */
  mediaSize?: MediaSizeKey
  resource?: MediaType | string | number | null
  /** HTML sizes attribute for responsive srcSet selection */
  size?: string
  src?: StaticImageData | string
  videoClassName?: string
}
