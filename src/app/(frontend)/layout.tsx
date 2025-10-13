import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { generalSans, ceraPro } from '@/app/fonts'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { SITE_NAME, DEFAULT_TITLE, DEFAULT_DESC, DEFAULT_OG_IMAGE } from '@/constants'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const metadataBase = new URL(getServerSideURL())
const LOCAL_DEV_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0'])
const enableSpeedInsightsEnv = process.env.NEXT_PUBLIC_ENABLE_SPEED_INSIGHTS
const shouldRenderSpeedInsights =
  enableSpeedInsightsEnv === 'true'
    ? true
    : enableSpeedInsightsEnv === 'false'
      ? false
      : process.env.NODE_ENV === 'production' && !LOCAL_DEV_HOSTNAMES.has(metadataBase.hostname)

export const metadata: Metadata = {
  metadataBase,

  // Title template: pages that set `title: "Article Title"` will render as "Article Title | Eutopias"
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESC,

  openGraph: {
    ...mergeOpenGraph(),
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: [DEFAULT_OG_IMAGE],
  },

  twitter: {
    card: 'summary_large_image',
    creator: '@eutopiasmag',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: [DEFAULT_OG_IMAGE],
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
  },

  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable, generalSans.variable, ceraPro.variable)}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {/* Favicon links are redundant here because they're already in metadata.icons */}
      </head>
      <body>
        <Providers>
          <AdminBar adminBarProps={{ preview: isEnabled }} />
          <Header />
          {children}
          {shouldRenderSpeedInsights ? <SpeedInsights /> : null}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
