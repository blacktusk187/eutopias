import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null, serverUrl?: string) => {
  const baseUrl = serverUrl || getServerSideURL()
  const templateUrl = baseUrl + '/website-template-OG.webp'

  // Check if image is a Media object (not just an ID)
  if (image && typeof image === 'object' && image !== null && 'url' in image) {
    const media = image as Media
    // Prefer OG size if available, otherwise use the main URL
    const ogUrl = media.sizes?.og?.url
    const imageUrl = media.url

    if (ogUrl) {
      // Ensure absolute URL
      const absoluteUrl = ogUrl.startsWith('http') ? ogUrl : baseUrl + ogUrl
      // Only return if it's not the template image
      if (!absoluteUrl.includes('website-template-OG.webp')) {
        return absoluteUrl
      }
    } else if (imageUrl) {
      // Ensure absolute URL
      const absoluteUrl = imageUrl.startsWith('http') ? imageUrl : baseUrl + imageUrl
      // Only return if it's not the template image
      if (!absoluteUrl.includes('website-template-OG.webp')) {
        return absoluteUrl
      }
    }
  }

  // Return template as fallback
  return templateUrl
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args
  const serverUrl = getServerSideURL()

  // For Posts, use meta.image if available, otherwise fall back to heroImage
  let imageToUse: Media | null | undefined = undefined

  // Check meta.image first
  if (doc?.meta?.image && typeof doc.meta.image === 'object' && 'url' in doc.meta.image) {
    imageToUse = doc.meta.image as Media
  }

  // Fall back to heroImage if meta.image is not available
  if (!imageToUse && doc && 'heroImage' in doc && doc.heroImage) {
    if (typeof doc.heroImage === 'object' && doc.heroImage !== null && 'url' in doc.heroImage) {
      imageToUse = doc.heroImage as Media
    }
  }

  const ogImage = getImageURL(imageToUse, serverUrl)

  // Build canonical URL. If no slug, default to root
  const slugPath = Array.isArray(doc?.slug)
    ? `/${doc?.slug.join('/')}`
    : typeof doc?.slug === 'string'
      ? `/${doc?.slug}`
      : '/'

  // Normalize: /home should canonicalize to /
  const canonicalPath = slugPath === '/home' ? '/' : slugPath
  
  // Check if this is the homepage
  const isHomepage = canonicalPath === '/' || doc?.slug === 'home'

  // For homepage, always use the default title. For other pages/posts, use meta.title if available, otherwise fall back to title field
  let metaTitle: string | undefined = undefined
  if (!isHomepage) {
    metaTitle = doc?.meta?.title
    if (!metaTitle && doc && 'title' in doc && doc.title) {
      metaTitle = doc.title as string
    }
  }
  const title = metaTitle ? metaTitle + ' | Eutopias' : 'Eutopias | Mission-driven storytelling'
  const siteDescription =
    'Mission-driven storytelling that elevates real-world solutions through multimedia.'
  const description = doc?.meta?.description || siteDescription
  const canonicalUrl = new URL(canonicalPath, serverUrl).toString()

  // Open Graph URL must be absolute for Facebook
  const ogUrl = new URL(canonicalPath, serverUrl).toString()

  // Determine if this is a Post (article) vs Page (website)
  const isPost = doc && ('heroImage' in doc || 'content' in doc)

  // Get Facebook App ID from environment variable
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID

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
    // Add other metadata for Facebook (fb:app_id)
    other: {
      ...(facebookAppId && {
        'fb:app_id': facebookAppId,
      }),
    },
  }
}
