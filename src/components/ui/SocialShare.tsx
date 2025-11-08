'use client'
import React, { useState, useEffect } from 'react'
import { getClientSideURL } from '@/utilities/getURL'
import { RiTwitterXFill } from 'react-icons/ri'
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaEnvelope, FaLink, FaCheck } from 'react-icons/fa'

type Props = {
  urlPath?: string
  absoluteUrl?: string
  title: string
  className?: string
}

export const SocialShare: React.FC<Props> = ({ urlPath, absoluteUrl, title, className }) => {
  // Ensure we get the URL on the client side
  const [fullUrl, setFullUrl] = useState<string>('')
  const [instagramCopied, setInstagramCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    if (absoluteUrl) {
      setFullUrl(absoluteUrl)
      return
    }
    
    if (urlPath) {
      const origin = getClientSideURL()
      // Ensure urlPath starts with /
      const normalizedPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`
      // Construct absolute URL
      const url = `${origin}${normalizedPath}`
      setFullUrl(url)
      return
    }
    
    // Fallback to current page URL if nothing provided
    if (typeof window !== 'undefined') {
      setFullUrl(window.location.href)
    }
  }, [absoluteUrl, urlPath])

  const onWebShare = async () => {
    if (navigator?.share && fullUrl) {
      try {
        await navigator.share({ title, url: fullUrl })
        return
      } catch {
        // ignore
      }
    }
    if (fullUrl) {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
        '_blank',
        'noopener,noreferrer'
      )
    }
  }

  const iconButtonClass =
    'inline-flex items-center justify-center w-9 h-9 rounded-full bg-foreground/10 hover:bg-foreground/15 text-foreground mr-2'

  const emailHref = fullUrl
    ? `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(fullUrl)}`
    : '#'

  const handleInstagramShare = async () => {
    if (fullUrl) {
      try {
        await navigator.clipboard.writeText(fullUrl)
        setInstagramCopied(true)
        setTimeout(() => setInstagramCopied(false), 2000)
        // Open Instagram - user can paste the link
        window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer')
      } catch (err) {
        // Fallback: try to copy to clipboard using execCommand
        const textArea = document.createElement('textarea')
        textArea.value = fullUrl
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          setInstagramCopied(true)
          setTimeout(() => setInstagramCopied(false), 2000)
          window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer')
        } catch (e) {
          // If all else fails, just open Instagram
          window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer')
        } finally {
          if (document.body.contains(textArea)) {
            document.body.removeChild(textArea)
          }
        }
      }
    }
  }

  const handleCopyLink = async () => {
    if (fullUrl) {
      try {
        await navigator.clipboard.writeText(fullUrl)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
      } catch (err) {
        // Fallback: try to copy to clipboard using execCommand
        const textArea = document.createElement('textarea')
        textArea.value = fullUrl
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          setLinkCopied(true)
          setTimeout(() => setLinkCopied(false), 2000)
        } catch (e) {
          // Silently fail
        } finally {
          if (document.body.contains(textArea)) {
            document.body.removeChild(textArea)
          }
        }
      }
    }
  }

  // Don't render if we don't have a valid URL
  if (!fullUrl) {
    return null
  }

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
        onClick={handleInstagramShare}
        className={iconButtonClass}
        aria-label="Copy link for Instagram"
        title={instagramCopied ? "Link copied! Paste in Instagram" : "Copy link for Instagram"}
      >
        {instagramCopied ? <FaCheck size={16} /> : <FaInstagram size={16} />}
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
        onClick={handleCopyLink}
        className={iconButtonClass}
        aria-label="Copy link"
        title={linkCopied ? "Link copied!" : "Copy link to clipboard"}
      >
        {linkCopied ? <FaCheck size={16} /> : <FaLink size={16} />}
      </button>
    </div>
  )
}
