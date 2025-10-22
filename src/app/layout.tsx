// src/app/layout.tsx
import './(frontend)/globals.css'

export const metadata = {
  title: 'Eutopias',
  description: 'SEO Live Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">{children}</body>
    </html>
  )
}
