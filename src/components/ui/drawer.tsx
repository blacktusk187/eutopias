'use client'

import React, { useEffect } from 'react'

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: 'left' | 'right'
  className?: string
  children: React.ReactNode
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onOpenChange,
  side = 'left',
  className,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      // lock body scroll while open
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = originalOverflow
      }
    }

    return () => {}
  }, [open, onOpenChange])

  if (!open) return null

  const sideTranslate = side === 'left' ? 'translate-x-0' : 'translate-x-0'

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <button
        aria-label="Close menu"
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`absolute top-0 bottom-0 ${
          side === 'left' ? 'left-0' : 'right-0'
        } w-80 max-w-[85%] bg-card text-card-foreground shadow-xl border border-border transform ${sideTranslate} transition-transform duration-200 ${
          className || ''
        }`}
      >
        {children}
      </div>
    </div>
  )
}

interface DrawerHeaderProps {
  children: React.ReactNode
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({ children }) => {
  return <div className="px-5 py-4 border-b border-border">{children}</div>
}

interface DrawerContentProps {
  children: React.ReactNode
}

export const DrawerContent: React.FC<DrawerContentProps> = ({ children }) => {
  return <div className="px-5 py-4 overflow-y-auto h-full">{children}</div>
}
