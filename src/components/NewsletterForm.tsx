'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export const NewsletterForm: React.FC<{ className?: string }> = ({ className }) => {
  const [email, setEmail] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = data?.error || 'Subscription failed. Please try again later.'
        setError(msg)
        toast.error(msg)
      } else {
        setMessage('Thanks for subscribing! Please check your inbox.')
        toast.success('Subscribed successfully')
        setEmail('')
      }
    } catch (e) {
      setError('Network error. Please try again.')
      toast.error('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Email address"
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-eutopias-blue hover:bg-eutopias-blue/90 text-white"
        >
          {isSubmitting ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </div>
      {message && <p className="mt-3 text-sm text-foreground">{message}</p>}
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </form>
  )
}
