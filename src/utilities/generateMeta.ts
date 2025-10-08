import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url
    const imageUrl = ogUrl || image.url

    if (imageUrl) {
      // Convert to direct S3 URL if it's a PayloadCMS API URL
      if (imageUrl.startsWith('/api/media/file/')) {
        const filename = imageUrl.replace('/api/media/file/', '')
        const s3Bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'eutopias-magazine-media'
        const s3Region = process.env.NEXT_PUBLIC_S3_REGION || 'us-east-2'
        url = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/uploads/${filename}`
      } else if (imageUrl.startsWith('http')) {
        url = imageUrl
      } else {
        url = `${serverUrl}${imageUrl}`
      }
    }
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title ? doc?.meta?.title + ' | Eutopias' : 'Eutopias'

  // Create a better fallback description
  const defaultDescription =
    'Mission-driven storytelling that elevates real-world solutions through multimedia. Discover inspiring stories, innovative ideas, and transformative content.'
  const description = doc?.meta?.description || defaultDescription

  return {
    description,
    openGraph: mergeOpenGraph({
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
