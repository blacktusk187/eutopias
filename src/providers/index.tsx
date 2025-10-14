'use client'

import React from 'react'
import { Toaster } from 'sonner'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </>
  )
}
