import localFont from 'next/font/local'

export const generalSans = localFont({
  src: [
    {
      path: '../../public/fonts/GeneralSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GeneralSans-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GeneralSans-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-general-sans',
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
  preload: false, // Defer preload to avoid unused CSS warnings
})

export const ceraPro = localFont({
  src: [
    {
      path: '../../public/fonts/CeraPro-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/CeraPro-Medium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/CeraPro-Bold.woff',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-cera-pro',
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
  preload: false, // Don't preload secondary font
})
