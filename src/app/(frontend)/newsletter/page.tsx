import type { Metadata } from 'next'
import Image from 'next/image'
import { NewsletterForm } from '@/components/NewsletterForm'
import { getMediaUrl } from '@/utilities/getMediaUrl'

export function generateMetadata(): Metadata {
  return {
    title: 'Newsletter - Eutopias',
    description: 'Subscribe to our newsletter for the latest stories and updates.',
  }
}

export default function NewsletterPage() {
  const bannerUrl = getMediaUrl(
    'https://www.eutopias.co/api/media/file/andrew-neel-cckf4TsHAuw-unsplash%20(1).jpg',
    '2025-10-14T03:46:00.790Z',
  )
  return (
    <div className="pb-24">
      {/* Top banner to match other pages */}
      <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat md:h-64">
        <Image
          alt="Newsletter Banner"
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src={bannerUrl}
        />
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
        <div className="relative z-10 text-center">
          <h1 className="font-cera text-4xl font-bold uppercase tracking-wide text-white md:text-6xl">
            Newsletter
          </h1>
        </div>
      </div>

      <div className="container mt-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Stay Connected</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Subscribe to our newsletter and be the first to discover inspiring stories, innovative
            ideas, and transformative content.
          </p>

          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Subscribe to our newsletter</h2>
            <p className="text-muted-foreground mb-6">Get new stories and updates in your inbox.</p>
            <NewsletterForm />
          </div>

          {/* Removed closing note */}
        </div>
      </div>
    </div>
  )
}
