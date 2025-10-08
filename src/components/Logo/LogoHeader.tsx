import clsx from 'clsx'
import React from 'react'
import Image from 'next/image'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
}

export const LogoHeader = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || false

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="relative flex-shrink-0">
        <Image
          src="https://eutopias-magazine-media.s3.us-east-2.amazonaws.com/uploads/eutopias-leaf-blue.webp"
          alt="Eutopias Logo"
          width={32}
          height={32}
          className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain"
          loading={loading}
          priority={priority}
        />
      </div>
      <h1
        className="font-cera font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl uppercase tracking-tight transition-colors hover:text-[#eebc2a] hover:font-bold whitespace-nowrap"
        style={{ color: '#003366' }}
      >
        EUTOPIAS
      </h1>
    </div>
  )
}
