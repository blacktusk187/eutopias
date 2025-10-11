'use client'

import React, { useState, useEffect } from 'react'
import { FiMenu, FiX, FiSearch } from 'react-icons/fi'
import type { Header as HeaderType, Category } from '@/payload-types'
import Link from 'next/link'

interface HeaderNavProps {
  data: HeaderType
  isSearchExpanded?: boolean
  onSearchToggle?: (expanded: boolean) => void
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  data: _data,
  isSearchExpanded: _isSearchExpanded = false,
  onSearchToggle: _onSearchToggle = () => {},
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
        console.log('Fetching categories...')
        const response = await fetch('/api/categories?limit=100&sort=title')
        console.log('Response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('Raw categories data:', data)
          console.log('Total categories:', data.docs?.length || 0)

          // Filter for only main categories (those without a parent)
          const mainCategories = (data.docs || []).filter((category: Category) => {
            console.log('Category:', category.title, 'Parent:', category.parent)
            return !category.parent
          })

          console.log('Main categories loaded:', mainCategories.length, 'categories')
          console.log(
            'Main categories:',
            mainCategories.map((c: Category) => c.title),
          )
          setCategories(mainCategories)
        } else {
          console.error('Failed to fetch categories:', response.status)
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
        {categories.length > 0 ? (
          categories.map((category) => (
            <Link
              key={category.id}
              href={`/posts/category/${category.slug}`}
              className="text-foreground hover:text-accent-foreground transition-colors font-medium relative group text-base"
            >
              {category.title}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">Loading categories...</div>
        )}
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
          href="/search"
          className="p-2 text-foreground hover:text-accent-foreground transition-colors"
        >
          <FiSearch className="h-5 w-5" />
        </Link>
        <Link
          href="/newsletter"
          className="bg-[#003366] text-white px-4 py-2 rounded-md font-medium hover:bg-[#002244] transition-colors"
        >
          Subscribe
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden transition-colors text-foreground hover:text-accent-foreground relative z-50 flex-shrink-0"
        aria-label="Toggle Menu"
        onClick={toggleMenu}
      >
        {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-card text-card-foreground shadow-md py-4 px-6 md:hidden z-50 border border-border">
          <div className="flex flex-col gap-4">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/posts/category/${category.slug}`}
                  className="text-card-foreground hover:text-accent-foreground transition-colors text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.title}
                </Link>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">Loading categories...</div>
            )}
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
                href="/search"
                className="flex items-center gap-2 text-card-foreground hover:text-accent-foreground transition-colors text-base py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiSearch className="h-5 w-5" />
                Search
              </Link>
              <Link
                href="/newsletter"
                className="block bg-[#003366] text-white px-4 py-2 rounded-md font-medium hover:bg-[#002244] transition-colors text-center mt-4"
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
