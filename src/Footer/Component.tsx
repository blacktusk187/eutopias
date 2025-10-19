import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiLinkedin, FiLink } from 'react-icons/fi'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  let footerData: Footer | null = null

  try {
    footerData = await getCachedGlobal('footer', 2)()
  } catch (error) {
    console.error('Error fetching footer data:', error)
  }

  // Fallback data if footer global is not found
  const fallbackData = {
    linkGroups: [
      {
        title: 'Legal',
        links: [
          { link: { type: 'custom', url: '/terms', label: 'Terms Of Use' } },
          { link: { type: 'custom', url: '/privacy', label: 'Privacy Policy' } },
        ],
      },
      {
        title: 'Our Sites',
        links: [
          { link: { type: 'custom', url: 'https://ecofarmfinder.com/', label: 'Eco Farm Finder' } },
          {
            link: {
              type: 'custom',
              url: 'https://www.linkedin.com/company/arcliving-co/',
              label: 'Arc Living',
            },
          },
        ],
      },
      {
        title: 'Join Us',
        links: [{ link: { type: 'custom', url: '/newsletter', label: 'Subscribe' } }],
      },
    ],
    socialLinks: [
      { platform: 'instagram', url: 'https://www.instagram.com/eutopias_co/' },
      { platform: 'facebook', url: 'https://www.facebook.com/EutopiasCo' },
      { platform: 'linkedin', url: 'https://www.linkedin.com/company/eutopias-co/' },
    ],
    followTitle: 'Follow us',
    copyright: 'Copyright © 2025 Eutopias. All rights reserved.',
  }

  const linkGroups = footerData?.linkGroups || fallbackData.linkGroups
  const socialLinks = footerData?.socialLinks || fallbackData.socialLinks
  const followTitle = footerData?.followTitle || fallbackData.followTitle
  const copyright = footerData?.copyright || fallbackData.copyright

  // Debug logging (can be removed in production)
  // console.log('Footer data:', footerData)
  // console.log('Using fallback:', !footerData)
  // console.log('Link groups:', linkGroups)

  return (
    <footer className="mt-auto bg-gray-800 text-white">
      <div className="container pt-8 pb-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {linkGroups.length > 0 ? (
            linkGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-extra-wide">
                  {group.title}
                </h3>
                <ul className="space-y-2">
                  {group.links?.map(({ link }, linkIndex) => (
                    <li key={linkIndex}>
                      <CMSLink
                        className="text-white/80 hover:text-white transition-colors text-sm"
                        {...link}
                        type={link.type as 'custom' | 'reference' | null}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-white/60">
              <p>Footer content is loading... (Link groups: {linkGroups.length})</p>
              <p className="text-xs mt-2">Check console for debug info</p>
            </div>
          )}

          {/* Follow Us - 4th Column */}
          {socialLinks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-extra-wide">
                {followTitle}
              </h3>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-white/80 transition-colors"
                    aria-label={social.platform}
                  >
                    {social.platform === 'instagram' && <FiInstagram className="w-5 h-5" />}
                    {social.platform === 'facebook' && <FiFacebook className="w-5 h-5" />}
                    {social.platform === 'x' && <FiTwitter className="w-5 h-5" />}
                    {social.platform === 'youtube' && <FiYoutube className="w-5 h-5" />}
                    {social.platform === 'linkedin' && <FiLinkedin className="w-5 h-5" />}
                    {social.platform === 'tiktok' && <FiLink className="w-5 h-5" />}
                    {social.platform === 'reddit' && <FiLink className="w-5 h-5" />}
                    {social.platform === 'custom' && <FiLink className="w-5 h-5" />}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Copyright */}
        {copyright && (
          <div className="border-t border-white/20 pt-8">
            <div className="text-sm text-white/60 text-center">{copyright}</div>
          </div>
        )}
      </div>
    </footer>
  )
}
