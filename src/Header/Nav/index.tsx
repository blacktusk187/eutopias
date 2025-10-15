'use client'

import React, { useState, useEffect, useRef } from 'react'
import { FiMenu, FiX, FiSearch } from 'react-icons/fi'
import type { Header as HeaderType, Category, Post, Media } from '@/payload-types'
import Link from 'next/link'
import { Drawer, DrawerHeader, DrawerContent } from '@/components/ui/drawer'
import Image from 'next/image'
import { getMediaUrl } from '@/utilities/getMediaUrl'

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
  const [hoveredParentId, setHoveredParentId] = useState<number | null>(null)
  const [postsByParentId, setPostsByParentId] = useState<Record<number, Post[]>>({})
  const [isFetchingPosts, setIsFetchingPosts] = useState<Record<number, boolean>>({})
  const [drawerTop, setDrawerTop] = useState<number>(0)
  const closeTimerRef = useRef<number | null>(null)
  const navRef = useRef<HTMLElement | null>(null)

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

  const ensurePostsForParent = async (parentId: number) => {
    if (postsByParentId[parentId] || isFetchingPosts[parentId]) return
    setIsFetchingPosts((prev) => ({ ...prev, [parentId]: true }))
    try {
      const res = await fetch(
        `/api/posts?limit=3&depth=1&sort=-publishedAt&where[categories][contains]=${parentId}`,
      )
      if (res.ok) {
        const data = await res.json()
        setPostsByParentId((prev) => ({ ...prev, [parentId]: data.docs || [] }))
      }
    } catch (e) {
      console.error('Failed fetching posts for parent', parentId, e)
    } finally {
      setIsFetchingPosts((prev) => ({ ...prev, [parentId]: false }))
    }
  }

  const getPostThumbUrl = (post: Post): string => {
    const metaImage = post.meta?.image
    let candidate: string | undefined
    if (metaImage && typeof metaImage === 'object') {
      const media = metaImage as Media
      candidate = media.sizes?.thumbnail?.url || media.sizes?.small?.url || media.url || undefined
    }
    return getMediaUrl(candidate || '')
  }

  const recalcDrawerTop = () => {
    const el = navRef.current
    if (el) {
      const headerEl = el.closest('header') as HTMLElement | null
      const rect = (headerEl || el).getBoundingClientRect()
      setDrawerTop(rect.bottom + window.scrollY)
    }
  }

  useEffect(() => {
    if (hoveredParentId) {
      recalcDrawerTop()
      const onScroll = () => recalcDrawerTop()
      const onResize = () => recalcDrawerTop()
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onResize)
      return () => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onResize)
      }
    }
  }, [hoveredParentId])

  const scheduleClose = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => setHoveredParentId(null), 120)
  }

  const cancelClose = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  return (
    <nav ref={navRef} className="flex items-center">
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
            <div
              key={parent.id}
              className=""
              onMouseEnter={() => {
                cancelClose()
                setHoveredParentId(parent.id)
                void ensurePostsForParent(parent.id)
              }}
              onMouseLeave={scheduleClose}
            >
              <Link
                href={`/posts/category/${parent.slug}`}
                className="text-foreground hover:text-accent-foreground transition-colors font-medium text-base relative group z-[60]"
              >
                <span>{parent.title}</span>
                <span
                  className={
                    `pointer-events-none absolute -bottom-[2px] left-0 h-[2px] bg-foreground transition-all duration-300 ` +
                    (hoveredParentId === parent.id ? 'w-full' : 'w-0 group-hover:w-full')
                  }
                />
              </Link>

              {hoveredParentId === parent.id && (
                <div
                  className="fixed left-1/2 -translate-x-1/2 bg-card shadow-lg z-50 w-screen border-t border-border"
                  style={{ top: drawerTop }}
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                >
                  <div className="container">
                    <div className="grid grid-cols-12 gap-8 p-8">
                      {/* Left: subcategories */}
                      <div className="col-span-12 md:col-span-3 bg-card">
                        <div className="block px-2 py-1.5 text-sm font-medium text-card-foreground border-b border-border mb-2">
                          Topics
                        </div>
                        <div className="flex flex-col">
                          {children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/posts/category/${child.slug}`}
                              className="px-2 py-1.5 text-sm text-card-foreground hover:text-accent-foreground transition-colors"
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Right: 3 latest posts */}
                      <div className="col-span-12 md:col-span-9">
                        <div className="p-6 border-l border-border">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {(postsByParentId[parent.id] || new Array(3).fill(null)).map(
                              (post, idx) => {
                                if (!post) {
                                  return (
                                    <div
                                      key={`skeleton-${idx}`}
                                      className="animate-pulse flex gap-3"
                                    >
                                      <div className="w-24 h-16 bg-muted rounded" />
                                      <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded w-3/4" />
                                        <div className="h-4 bg-muted rounded w-2/5" />
                                      </div>
                                    </div>
                                  )
                                }
                                const imgUrl = getPostThumbUrl(post)
                                return (
                                  <Link
                                    key={post.id}
                                    href={`/posts/${post.slug}`}
                                    className="group"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="relative w-24 h-16 overflow-hidden rounded border border-border flex-shrink-0">
                                        {imgUrl ? (
                                          <Image
                                            src={imgUrl}
                                            alt={post.title || ''}
                                            fill
                                            className="object-cover"
                                            sizes="96px"
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-muted" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-foreground group-hover:text-accent-foreground transition-colors line-clamp-3">
                                          {post.title}
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                )
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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

      {/* Mobile Drawer */}
      <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen} side="left">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Menu</span>
            <button
              className="p-2 text-card-foreground hover:text-accent-foreground transition-colors"
              aria-label="Close Menu"
              onClick={() => setIsMenuOpen(false)}
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </DrawerHeader>
        <DrawerContent>
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
        </DrawerContent>
      </Drawer>
    </nav>
  )
}
