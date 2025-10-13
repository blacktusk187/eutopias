import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import {
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
  FaYoutube,
  FaLinkedinIn,
  FaRedditAlien,
} from 'react-icons/fa6'
import { SiTiktok } from 'react-icons/si'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { LogoFooter } from '@/components/Logo/LogoFooter'

type SocialIconProps = { className?: string }
const SocialIconMap: Record<string, React.ComponentType<SocialIconProps>> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  x: FaXTwitter,
  youtube: FaYoutube,
  linkedin: FaLinkedinIn,
  tiktok: SiTiktok,
  reddit: FaRedditAlien,
}

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const linkGroups = footerData?.linkGroups || []
  const socialLinks = footerData?.socialLinks || []
  const followTitle = footerData?.followTitle || 'Follow us'
  const copyright = footerData?.copyright

  return (
    <footer className="mt-auto border-t border-gray-500 bg-black text-white">
      {/* Top section: link groups + follow column */}
      <div className="container py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-8">
          {linkGroups.map((group, idx) => (
            <div key={idx}>
              {group?.title && (
                <div className="uppercase tracking-wide text-xs text-neutral-300 mb-3">
                  {group.title}
                </div>
              )}
              <nav className="flex flex-col gap-2">
                {group?.links?.map(({ link }, i) => (
                  <CMSLink key={i} className="text-white hover:text-yellow-400" {...link} />
                ))}
              </nav>
            </div>
          ))}

          {socialLinks?.length > 0 && (
            <div>
              <div className="uppercase tracking-wide text-xs text-neutral-300 mb-3">
                {followTitle}
              </div>
              <div className="flex items-center gap-4 text-white">
                {socialLinks.map((s, i) => {
                  const Icon = (s?.platform && SocialIconMap[s.platform]) || null
                  return (
                    <a
                      key={i}
                      href={s?.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s?.label || s?.platform || 'social link'}
                      className="text-white hover:text-yellow-400 transition-colors"
                    >
                      {Icon ? (
                        <Icon className="w-5 h-5" />
                      ) : (
                        <span className="text-sm">{s?.label || 'Link'}</span>
                      )}
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar: logo + copyright */}
      <div className="border-t border-gray-500 bg-white text-black">
        <div className="container py-6 flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex">
            <LogoFooter colorClass="text-eutopias-blue" />
          </Link>
          <div className="text-xs text-neutral-700">
            {copyright || 'Copyright © 2025 Eutopias'}
          </div>
        </div>
      </div>
    </footer>
  )
}
