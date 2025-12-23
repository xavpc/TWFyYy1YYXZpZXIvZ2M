'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = React.useState(false)

  // Force dark mode on initial load
  React.useEffect(() => {
    setMounted(true)
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <NextThemesProvider {...props} forcedTheme="dark">
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </NextThemesProvider>
  )
}