import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { getMediaUrl } from './getMediaUrl'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args
  const serverUrl = getServerSideURL()
  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title ? doc?.meta?.title + ' | Eutopias' : 'Eutopias Magazine'

  // Build canonical URL. If no slug, default to root
  const slugPath = Array.isArray(doc?.slug)
    ? `/${doc?.slug.join('/')}`
    : typeof doc?.slug === 'string'
      ? `/${doc?.slug}`
      : '/'

  // Normalize: /home should canonicalize to /
  const canonicalPath = slugPath === '/home' ? '/' : slugPath
  const canonicalUrl = new URL(canonicalPath, serverUrl).toString()

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: canonicalPath,
    }),
    alternates: {
      canonical: canonicalUrl,
    },
    title,
  }
}
