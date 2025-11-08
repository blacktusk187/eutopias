'use client'
import React from 'react'
import { getClientSideURL } from '@/utilities/getURL'
import { RiTwitterXFill } from 'react-icons/ri'
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaEnvelope, FaLink } from 'react-icons/fa'

type Props = {
  urlPath?: string
  absoluteUrl?: string
  title: string
  className?: string
}

export const SocialShare: React.FC<Props> = ({ urlPath, absoluteUrl, title, className }) => {
  const origin = getClientSideURL()
  const fullUrl = absoluteUrl || (urlPath ? `${origin}${urlPath}` : '')

  const onWebShare = async () => {
    if (navigator?.share) {
      try {
        await navigator.share({ title, url: fullUrl })
        return
      } catch {
        // ignore
      }
    }
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
    )
  }

  const iconButtonClass =
    'inline-flex items-center justify-center w-9 h-9 rounded-full bg-foreground/10 hover:bg-foreground/15 text-foreground mr-2'

  const emailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(fullUrl)}`

  return (
    <div className={className}>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconButtonClass}
        aria-label="Share on X"
        title="Share on X"
      >
        <RiTwitterXFill size={16} />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconButtonClass}
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <FaFacebookF size={16} />
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconButtonClass}
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
      >
        <FaLinkedinIn size={16} />
      </a>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(fullUrl)
          } catch {}
          window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer')
        }}
        className={iconButtonClass}
        aria-label="Share on Instagram"
        title="Share on Instagram (copy link)"
      >
        <FaInstagram size={16} />
      </button>
      <a
        href={emailHref}
        className={iconButtonClass}
        aria-label="Share via Email"
        title="Share via Email"
      >
        <FaEnvelope size={16} />
      </a>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(fullUrl)
          } catch {}
        }}
        className={iconButtonClass}
        aria-label="Copy link"
        title="Copy link"
      >
        <FaLink size={16} />
      </button>
    </div>
  )
}
