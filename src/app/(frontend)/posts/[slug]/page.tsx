// app/posts/[slug]/page.tsx
import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Post } from '@/payload-types'

import { ArticleLayout } from '@/components/ArticleLayout'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { ArticleViewTracker } from '@/components/ArticleViewTracker'

// Fallbacks from constants
import { DEFAULT_DESC, DEFAULT_OG_IMAGE } from '@/constants'
// -------------------- SSG params --------------------
export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return posts.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

// -------------------- Page --------------------
export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/posts/' + slug
  const post = await queryPostBySlug({ slug })

  if (!post) return <PayloadRedirects url={url} />

  return (
    <>
      <PageClient />
      <ArticleViewTracker slug={slug} />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <ArticleLayout post={post} />
    </>
  )
}

// -------------------- Metadata --------------------
export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = await queryPostBySlug({ slug })

  // Leaf title only; layout template appends " | Eutopias"
  const title = post?.title ?? 'Article not found'

  const description = (post as any)?.meta?.description ?? (post as any)?.excerpt ?? DEFAULT_DESC

  const ogImage = getOgImageUrl(post) ?? DEFAULT_OG_IMAGE

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      title, // leaf title
      description,
      images: [ogImage],
      url: `/posts/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title, // leaf title
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `/posts/${slug}`,
    },
  }
}

// -------------------- Data --------------------
const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    depth: 2,
    where: { slug: { equals: slug } },
  })

  return (result.docs?.[0] as Post) || null
})

// -------------------- Helpers --------------------
function getOgImageUrl(post: Post | null): string | undefined {
  if (!post) return undefined

  // Try common shapes your schema might produce
  // meta.image (media field populated at depth:2)
  const metaImage = (post as any)?.meta?.image
  if (typeof metaImage === 'object' && metaImage?.url) return metaImage.url

  // hero.image (media field) or hero direct url
  const heroImage = (post as any)?.hero?.image
  if (typeof heroImage === 'object' && heroImage?.url) return heroImage.url
  if ((post as any)?.hero?.url) return (post as any).hero.url

  // legacy/alternate field
  const ogImage = (post as any)?.ogImage
  if (typeof ogImage === 'object' && ogImage?.url) return ogImage.url

  // sizes (if Payload image sizes are enabled)
  const sizesSocial = (post as any)?.hero?.image?.sizes?.social?.url
  if (sizesSocial) return sizesSocial

  return undefined
}
