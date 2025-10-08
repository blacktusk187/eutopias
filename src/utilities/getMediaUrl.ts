import { getClientSideURL } from '@/utilities/getURL'

/**
 * Processes media resource URL to ensure proper formatting
 * Enforces all S3 objects to live under /uploads/
 *
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'eutopias-magazine-media'
  const region = process.env.NEXT_PUBLIC_S3_REGION || 'us-east-2'

  // Normalize cache tag
  const tag = cacheTag && cacheTag !== '' ? encodeURIComponent(cacheTag) : null

  // Case 1: Already an absolute S3/HTTP URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Ensure it points into /uploads/
    const u = new URL(url)
    let pathname = u.pathname.replace(/^\/+/, '')
    if (!pathname.startsWith('uploads/')) {
      pathname = `uploads/${pathname}`
    }
    const s3Url = `https://${u.hostname}/${pathname}`
    return tag ? `${s3Url}?${tag}` : s3Url
  }

  // Case 2: Payload CMS API proxy (/api/media/file/:filename)
  if (url.startsWith('/api/media/file/')) {
    const filename = url.replace('/api/media/file/', '').replace(/^\/+/, '')
    const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/uploads/${filename}`
    return tag ? `${s3Url}?${tag}` : s3Url
  }

  // Case 3: Relative path or bare filename
  const file = url.replace(/^\/+/, '')
  const withUploads = file.startsWith('uploads/') ? file : `uploads/${file}`
  const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${withUploads}`
  return tag ? `${s3Url}?${tag}` : s3Url
}
