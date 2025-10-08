import { getClientSideURL } from '@/utilities/getURL'

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) {
    return ''
  }

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  // Check if URL already has http/https protocol (direct S3)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return cacheTag ? `${url}?${cacheTag}` : url
  }

  // Check if this is a PayloadCMS API URL that we need to convert to S3
  if (url.startsWith('/api/media/file/')) {
    // Extract the filename from the API URL
    const filename = url.replace('/api/media/file/', '')
    // Use direct S3 URL with environment variables
    const s3Bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'eutopias-magazine-media'
    const s3Region = process.env.NEXT_PUBLIC_S3_REGION || 'us-east-2'
    const s3Url = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/uploads/${filename}`
    return cacheTag ? `${s3Url}?${cacheTag}` : s3Url
  }

  // Use direct S3 URL for all other cases
  const s3Bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'eutopias-magazine-media'
  const s3Region = process.env.NEXT_PUBLIC_S3_REGION || 'us-east-2'
  const s3Url = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/uploads/${url}`
  return cacheTag ? `${s3Url}?${cacheTag}` : s3Url
}
