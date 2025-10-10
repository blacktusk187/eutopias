import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Newsletter | Eutopias',
  description: 'Subscribe to our newsletter for the latest stories and updates.',
}

export default function NewsletterPage() {
  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Stay Connected</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Subscribe to our newsletter and be the first to discover inspiring stories, innovative
            ideas, and transformative content.
          </p>

          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Newsletter Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              We're working on setting up our newsletter subscription system. In the meantime, you
              can follow us on social media or check back later.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-[#003366] text-white px-6 py-3 rounded-md font-medium hover:bg-[#002244] transition-colors"
              >
                Back to Home
              </Link>
              <Link
                href="/posts"
                className="border border-border text-foreground px-6 py-3 rounded-md font-medium hover:bg-accent transition-colors"
              >
                Read Our Stories
              </Link>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Thank you for your interest in Eutopias!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
