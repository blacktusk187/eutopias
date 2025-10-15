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
  return typeof value === 'object' && value !== null && 'url' in value
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
<<<<<<< HEAD

    const normalizedPath = pathname.startsWith('uploads/') ? pathname : `uploads/${pathname}`
    return appendTag(`https://${parsed.hostname}/${normalizedPath}`)
=======
    // Re-attach hash fragment as encoded path if present
    const hashSuffix = u.hash ? `%23${u.hash.slice(1)}` : ''
    const s3Url = `https://${u.hostname}/${pathname}${hashSuffix}`
    return tag ? `${s3Url}?${tag}` : s3Url
>>>>>>> c5c8096 (Nav drawer updates)
  }

  if (url.startsWith('/api/media/file/')) {
<<<<<<< HEAD
    const filename = url.replace('/api/media/file/', '').replace(/^\/+/, '')
    return appendTag(`https://${bucket}.s3.${region}.amazonaws.com/uploads/${filename}`)
  }

  const file = url.replace(/^\/+/, '')
=======
    const filename = url.replace('/api/media/file/', '').replace(/^\/+/, '').replace(/#/g, '%23')
    const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/uploads/${filename}`
    return tag ? `${s3Url}?${tag}` : s3Url
  }

  // Case 3: Relative path or bare filename
  const file = url.replace(/^\/+/, '').replace(/#/g, '%23')
>>>>>>> c5c8096 (Nav drawer updates)
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
