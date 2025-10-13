import type { Metadata } from 'next'

import type { Page, Post } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { getMediaUrl } from './getMediaUrl'

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args
  const serverUrl = getServerSideURL()
  const fallbackImage = `${serverUrl}/website-template-OG.webp`

  const metaImage = doc?.meta?.image
  const hasResolvedImage =
    typeof metaImage === 'object' && metaImage !== null && 'url' in metaImage

  const ogImage = hasResolvedImage
    ? getMediaUrl(metaImage, {
        size: 'og',
        fallback: fallbackImage,
      }) || fallbackImage
    : fallbackImage

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
