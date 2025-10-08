'use client'
import Link from 'next/link'
import React, { useState } from 'react'

import type { Header } from '@/payload-types'

import { LogoHeader } from '@/components/Logo/LogoHeader'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  const handleSearchToggle = (expanded: boolean) => {
    setIsSearchExpanded(expanded)
  }

  return (
    <header className="container relative z-20">
      <div className="py-4 md:py-8">
        {/* Mobile Layout: Hamburger - Logo - Search */}
        <div className="md:hidden">
          {!isSearchExpanded ? (
            <div className="flex items-center justify-between">
              <HeaderNav
                data={data}
                isSearchExpanded={isSearchExpanded}
                onSearchToggle={handleSearchToggle}
              />
              <Link href="/" className="block flex-shrink-0">
                <LogoHeader />
              </Link>
              <div className="flex-shrink-0">{/* Search handled in HeaderNav component */}</div>
            </div>
          ) : (
            <div className="w-full">{/* Search handled in HeaderNav component */}</div>
          )}
        </div>

        {/* Desktop Layout: Logo - Navigation */}
        <div className="hidden md:flex justify-between items-center gap-4">
          <Link href="/" className="block flex-shrink-0 min-w-0">
            <LogoHeader />
          </Link>
          <div className="flex items-center gap-4">
            <HeaderNav
              data={data}
              isSearchExpanded={isSearchExpanded}
              onSearchToggle={handleSearchToggle}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
