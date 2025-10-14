'use client'

import React from 'react'
import { Toaster } from 'sonner'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          success: {
            style: {
              background: '#12425A', // Payload success-800
              color: '#ffffff',
              border: '1px solid #132C3A', // Payload success-900
            },
          },
          error: {
            style: {
              background: '#692725', // Payload error-800
              color: '#ffffff',
              border: '1px solid #40201D', // Payload error-900
            },
          },
        }}
      />
    </>
  )
}
