import clsx from 'clsx'
import React from 'react'
import Image from 'next/image'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
  weightClass?: string
}

export const LogoHeader = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className, weightClass } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || false

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="relative flex-shrink-0">
        <Image
          src="https://eutopias-magazine-media.s3.us-east-2.amazonaws.com/uploads/eutopias-blue-circle-300x300.webp"
          alt="Eutopias Circle Logo"
          width={56}
          height={56}
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
          loading={loading}
          priority={priority}
        />
      </div>
      <h1
        className={clsx(
          'eutopias-wordmark font-vanitas text-lg sm:text-xl md:text-2xl lg:text-3xl transition-colors hover:text-[#eebc2a] whitespace-nowrap',
          weightClass,
        )}
        style={{ color: '#003366' }}
      >
        EUTOPIAS
      </h1>
    </div>
  )
}
