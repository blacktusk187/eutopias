// src/app/layout.tsx
// import './globals.css' // keep if you have Tailwind/global CSS

export const metadata = {
  title: 'Eutopias',
  description: 'SEO Live Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">{children}</body>
    </html>
  )
}
