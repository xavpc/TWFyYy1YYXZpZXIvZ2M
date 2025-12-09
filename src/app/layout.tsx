'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import './globals.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ModeButton } from '@/components/ModeButton'
import { usePathname } from 'next/navigation' // Import the hook

// export const metadata: Metadata = {
//   title: 'Garbage Collection System',
//   description: 'Management Dashboard',
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname() // Get the current path

  const isLoginPage = pathname === '/login' // Check if we’re on the login page

  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head />
      <body>
        <SidebarProvider>
          {!isLoginPage && <AppSidebar />}{' '}
          {/* Only show the sidebar if not on login page */}
          <main className=' relative w-full'>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
            >
              {children}
              {!isLoginPage && ( // Only show the ModeButton if not on login page
                <div className='fixed right-5 top-2'>
                  <ModeButton />
                </div>
              )}
            </ThemeProvider>
          </main>
        </SidebarProvider>
      </body>
    </html>
  )
}
