import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

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

  // For Posts, use meta.image if available, otherwise fall back to heroImage
  let imageToUse = doc?.meta?.image
  if (!imageToUse && doc && 'heroImage' in doc && doc.heroImage) {
    imageToUse = doc.heroImage as Media | null
  }
  const ogImage = getImageURL(imageToUse)

  // For Posts, use meta.title if available, otherwise fall back to title field
  let metaTitle = doc?.meta?.title
  if (!metaTitle && doc && 'title' in doc && doc.title) {
    metaTitle = doc.title as string
  }
  const title = metaTitle ? metaTitle + ' | Eutopias' : 'Eutopias Magazine'
  const siteDescription =
    'Mission-driven storytelling that elevates real-world solutions through multimedia.'
  const description = doc?.meta?.description || siteDescription

  // Build canonical URL. If no slug, default to root
  const slugPath = Array.isArray(doc?.slug)
    ? `/${doc?.slug.join('/')}`
    : typeof doc?.slug === 'string'
      ? `/${doc?.slug}`
      : '/'

  // Normalize: /home should canonicalize to /
  const canonicalPath = slugPath === '/home' ? '/' : slugPath
  const canonicalUrl = new URL(canonicalPath, serverUrl).toString()

  // Open Graph URL must be absolute for Facebook
  const ogUrl = new URL(canonicalPath, serverUrl).toString()

  // Determine if this is a Post (article) vs Page (website)
  const isPost = doc && ('heroImage' in doc || 'content' in doc)

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
      type: isPost ? 'article' : 'website',
      url: ogUrl,
    }),
    alternates: {
      canonical: canonicalUrl,
    },
    title,
  }
}
