import type { Config, Media } from '@/payload-types'

type MediaInput =
  | Media
  | Config['db']['defaultIDType']
  | string
  | null
  | undefined

type Options = {
  /** Optional size key to prefer when resolving responsive media */
  size?: keyof NonNullable<Media['sizes']>
  /** Fallback URL to return when a media URL cannot be resolved */
  fallback?: string
  /** Optional cache-busting tag appended as a query string */
  cacheTag?: string | null
}

const isMediaObject = (value: MediaInput): value is Media => {
  return Boolean(value) && typeof value === 'object' && 'url' in value
}

const toS3Url = (url: string | null | undefined, cacheTag?: string | null): string | undefined => {
  if (!url) return undefined

  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'eutopias-magazine-media'
  const region = process.env.NEXT_PUBLIC_S3_REGION || 'us-east-2'
  const tag = cacheTag && cacheTag !== '' ? encodeURIComponent(cacheTag) : null

  const appendTag = (value: string) => (tag ? `${value}?${tag}` : value)

  if (url.startsWith('http://') || url.startsWith('https://')) {
    const parsed = new URL(url)
    const pathname = parsed.pathname.replace(/^\/+/, '')

    if (pathname.startsWith('api/media/file/')) {
      const filename = pathname.replace('api/media/file/', '').replace(/^\/+/, '')
      return appendTag(`https://${bucket}.s3.${region}.amazonaws.com/uploads/${filename}`)
    }

    const normalizedPath = pathname.startsWith('uploads/') ? pathname : `uploads/${pathname}`
    return appendTag(`https://${parsed.hostname}/${normalizedPath}`)
  }

  if (url.startsWith('/api/media/file/')) {
    const filename = url.replace('/api/media/file/', '').replace(/^\/+/, '')
    return appendTag(`https://${bucket}.s3.${region}.amazonaws.com/uploads/${filename}`)
  }

  const file = url.replace(/^\/+/, '')
  const withUploads = file.startsWith('uploads/') ? file : `uploads/${file}`
  return appendTag(`https://${bucket}.s3.${region}.amazonaws.com/${withUploads}`)
}

const normalizeOptions = (options?: Options | string | null): Options => {
  if (typeof options === 'string' || typeof options === 'undefined' || options === null) {
    return { cacheTag: options ?? undefined }
  }

  return options
}

export const getMediaUrl = (media: MediaInput, options?: Options | string | null): string => {
  const { size, fallback, cacheTag } = normalizeOptions(options)
  const fallbackUrl = fallback ?? ''

  if (!media) {
    return fallbackUrl
  }

  if (typeof media === 'string') {
    return toS3Url(media, cacheTag) ?? fallbackUrl
  }

  if (isMediaObject(media)) {
    const sizedUrl = size ? media.sizes?.[size]?.url : undefined
    const urlToUse = sizedUrl || media.url

    return toS3Url(urlToUse ?? undefined, cacheTag) ?? fallbackUrl
  }

  return fallbackUrl
}
