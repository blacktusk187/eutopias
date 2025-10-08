'use client'

import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import type { Header as HeaderType, Category } from '@/payload-types'
import Link from 'next/link'

interface HeaderNavProps {
  data: HeaderType
  isSearchExpanded?: boolean
  onSearchToggle?: (expanded: boolean) => void
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  data: _data,
  isSearchExpanded = false,
  onSearchToggle = () => {},
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Define the More dropdown items
  const moreItems: { href: string; label: string }[] = []

  useEffect(() => {
    // Fetch categories from Payload's built-in API
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?limit=100&sort=title')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.docs || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  return (
    <nav className="flex items-center">
      {/* Desktop Navigation */}
      <div className="hidden md:flex gap-6 items-center">
        {!isSearchExpanded && (
          <>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/posts/category/${category.slug}`}
                className="text-foreground hover:text-accent-foreground transition-colors font-medium relative group text-base"
              >
                {category.title}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
            {moreItems.length > 0 && (
              <div className="relative group">
                <button className="text-foreground hover:text-accent-foreground transition-colors font-medium text-base">
                  More
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {moreItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <Link
              href="/newsletter"
              className="bg-[#003366] text-white px-4 py-2 rounded-md font-medium hover:bg-[#002244] transition-colors"
            >
              Subscribe
            </Link>
          </>
        )}
        {/* Search component will be added later */}
      </div>

      {/* Mobile Menu Button */}
      {!isSearchExpanded && (
        <button
          className="md:hidden transition-colors text-foreground hover:text-accent-foreground relative z-50 flex-shrink-0"
          aria-label="Toggle Menu"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-card text-card-foreground shadow-md py-4 px-6 md:hidden z-50 border border-border">
          <div className="flex flex-col gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/posts/category/${category.slug}`}
                className="text-card-foreground hover:text-accent-foreground transition-colors text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.title}
              </Link>
            ))}
            {moreItems.length > 0 && (
              <div className="border-t border-border pt-4 mt-2">
                <div className="text-sm font-medium text-muted-foreground mb-2">More</div>
                {moreItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="block text-card-foreground hover:text-accent-foreground transition-colors text-base py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
            <div className="border-t border-border pt-4 mt-4">
              <Link
                href="/newsletter"
                className="block bg-[#003366] text-white px-4 py-2 rounded-md font-medium hover:bg-[#002244] transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
