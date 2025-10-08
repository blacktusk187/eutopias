'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import React, { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  isExpanded: boolean
  onToggle: (expanded: boolean) => void
  isMobile?: boolean
}

export const SearchBar: React.FC<SearchBarProps> = ({ isExpanded, onToggle, isMobile = false }) => {
  const [value, setValue] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    if (debouncedValue) {
      router.push(`/search?q=${debouncedValue}`)
    }
  }, [debouncedValue, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      router.push(`/search?q=${value.trim()}`)
    }
  }

  const clearSearch = () => {
    setValue('')
    onToggle(false)
    if (inputRef.current) {
      inputRef.current.blur()
    }
  }

  const handleSearchIconClick = () => {
    onToggle(true)
    // Focus the input after a short delay to ensure it's rendered
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }

  const handleClose = () => {
    setValue('')
    onToggle(false)
    if (inputRef.current) {
      inputRef.current.blur()
    }
  }

  const handleBlur = () => {
    // Delay hiding to allow for clicking on results
    setTimeout(() => {
      if (!value.trim()) {
        onToggle(false)
      }
    }, 200)
  }

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  // Desktop: Show magnifying glass icon initially, expand to full width when clicked
  if (!isMobile) {
    return (
      <>
        {!isExpanded ? (
          // Show only the magnifying glass icon
          <button
            onClick={handleSearchIconClick}
            className="p-2 text-foreground hover:text-accent-foreground transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        ) : (
          // Show the full-width search bar that covers nav items
          <div className="flex items-center gap-2 bg-card border border-border shadow-lg px-4 py-2">
            <button
              type="button"
              onClick={handleClose}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
            <form onSubmit={handleSubmit} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
                placeholder="Search Here"
                className="pl-10 pr-4 w-full h-10 text-sm bg-background border-border focus:border-[#003366] focus:ring-[#003366] rounded-none"
              />
            </form>
          </div>
        )}
      </>
    )
  }

  // Mobile: Show icon initially, expand to full width
  return (
    <div ref={containerRef} className="relative">
      {!isExpanded ? (
        // Show only the magnifying glass icon
        <button
          onClick={handleSearchIconClick}
          className="p-2 text-foreground hover:text-accent-foreground transition-colors"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      ) : (
        // Show the full-width search bar that maintains nav height
        <div className="w-full bg-card border-b border-border shadow-sm">
          <form onSubmit={handleSubmit} className="flex items-center w-full px-4 py-3">
            <button
              type="button"
              onClick={handleClose}
              className="mr-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
                placeholder="Search Here"
                className="pl-10 pr-4 w-full h-10 text-sm bg-background border-border focus:border-[#003366] focus:ring-[#003366] rounded-none"
              />
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
