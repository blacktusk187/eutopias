'use client'

import React from 'react'
import { cn } from '@/utilities/ui'

interface CategoryBannerProps {
  title: string
  backgroundImage?: string
  imagePosition?: 'top' | 'center' | 'bottom'
  className?: string
}

export const CategoryBanner: React.FC<CategoryBannerProps> = ({
  title,
  backgroundImage,
  imagePosition = 'center',
  className,
}) => {
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: `center ${imagePosition}`,
      }
    : {}

  return (
    <div
      className={cn(
        'relative w-full h-48 md:h-64 bg-cover bg-center bg-no-repeat flex items-center justify-center',
        'before:absolute before:inset-0 before:bg-black/40 before:z-0',
        !backgroundImage && 'bg-gradient-to-br from-eutopias-blue to-eutopias-gold',
        className,
      )}
      style={backgroundStyle}
    >
      <div className="relative z-10 text-center">
        <h1 className="font-cera text-4xl md:text-6xl font-bold text-white uppercase tracking-wide">
          {title}
        </h1>
      </div>
    </div>
  )
}
