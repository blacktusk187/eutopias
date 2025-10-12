'use client'

import React from 'react'
import Link from 'next/link'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import { cn } from '@/utilities/ui'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}>
      <Link 
        href="/" 
        className="flex items-center hover:text-foreground transition-colors"
        aria-label="Home"
      >
        <FiHome className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <FiChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
