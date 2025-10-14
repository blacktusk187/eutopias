import type { Metadata } from 'next'
import { NewsletterForm } from '@/components/NewsletterForm'

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
