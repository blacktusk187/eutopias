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
  const [openParents, setOpenParents] = useState<Record<number, boolean>>({})

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

  const parents = categories.filter((c) => !c.parent)
  const childrenByParentId = categories.reduce<Record<number, Category[]>>((acc, c) => {
    const p = typeof c.parent === 'object' ? c.parent?.id : c.parent
    if (p) {
      acc[p] = acc[p] || []
      acc[p].push(c)
    }
    return acc
  }, {})

  // Separate Featured from other parents and add it at the end
  const featuredCategory = parents.find((c) => c.slug === 'featured')
  const otherParents = parents.filter((c) => c.slug !== 'featured')

  return (
    <nav className="flex items-center">
      {/* Desktop Navigation */}
      <div className="hidden md:flex gap-6 items-center">
        {otherParents.map((parent) => {
          const children = childrenByParentId[parent.id] || []
          const hasChildren = children.length > 0
          if (!hasChildren) {
            return (
              <Link
                key={parent.id}
                href={`/posts/category/${parent.slug}`}
                className="text-foreground hover:text-accent-foreground transition-colors font-medium relative group text-base"
              >
                {parent.title}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground group-hover:w-full transition-all duration-300"></span>
              </Link>
            )
          }
          return (
            <div key={parent.id} className="relative group">
              <Link
                href={`/posts/category/${parent.slug}`}
                className="text-foreground hover:text-accent-foreground transition-colors font-medium text-base relative group/link"
              >
                {parent.title}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground group-hover/link:w-full transition-all duration-300"></span>
              </Link>
              <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link
                  href={`/posts/category/${parent.slug}`}
                  className="block px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border"
                >
                  All {parent.title}
                </Link>
                {children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/posts/category/${child.slug}`}
                    className="block px-4 py-2 text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
        {/* Featured category at the end */}
        {featuredCategory && (
          <Link
            key={featuredCategory.id}
            href={`/posts/category/${featuredCategory.slug}`}
            className="text-foreground hover:text-accent-foreground transition-colors font-medium relative group text-base"
          >
            {featuredCategory.title}
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground group-hover:w-full transition-all duration-300"></span>
          </Link>
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
          <div className="flex flex-col gap-2">
            {otherParents.map((parent) => {
              const children = childrenByParentId[parent.id] || []
              const hasChildren = children.length > 0
              const isOpen = openParents[parent.id]
              if (!hasChildren) {
                return (
                  <Link
                    key={parent.id}
                    href={`/posts/category/${parent.slug}`}
                    className="text-card-foreground hover:text-accent-foreground transition-colors text-base py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {parent.title}
                  </Link>
                )
              }
              return (
                <div key={parent.id} className="border-b border-border pb-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/posts/category/${parent.slug}`}
                      className="text-card-foreground hover:text-accent-foreground transition-colors text-base py-2 flex-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {parent.title}
                    </Link>
                    <button
                      className="p-2 text-card-foreground hover:text-accent-foreground transition-colors"
                      onClick={() =>
                        setOpenParents((prev) => ({ ...prev, [parent.id]: !prev[parent.id] }))
                      }
                      aria-expanded={Boolean(isOpen)}
                      aria-controls={`mobile-children-${parent.id}`}
                    >
                      <svg
                        className="h-4 w-4 transition-transform"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path d="M14 8L10 12L6 8" stroke="currentColor" strokeLinecap="square" />
                      </svg>
                    </button>
                  </div>
                  {isOpen && (
                    <div id={`mobile-children-${parent.id}`} className="pl-3 flex flex-col">
                      <Link
                        href={`/posts/category/${parent.slug}`}
                        className="py-1.5 text-sm font-medium text-card-foreground hover:text-accent-foreground transition-colors border-b border-border mb-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        All {parent.title}
                      </Link>
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/posts/category/${child.slug}`}
                          className="py-1.5 text-sm text-card-foreground hover:text-accent-foreground transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            {/* Featured category at the end */}
            {featuredCategory && (
              <Link
                key={featuredCategory.id}
                href={`/posts/category/${featuredCategory.slug}`}
                className="text-card-foreground hover:text-accent-foreground transition-colors text-base py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {featuredCategory.title}
              </Link>
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
