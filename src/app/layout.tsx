import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import './globals.css'
import type { Metadata } from 'next'

import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ModeButton } from '@/components/ModeButton'

export const metadata: Metadata = {
  title: 'Garbage Collection System',
  description: 'Management Dashboard',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head />
      <body>
        <SidebarProvider>
          <AppSidebar />
          <main className='p-5 relative w-full'>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <div className='fixed right-5 top-2'>
                <ModeButton />
              </div>
            </ThemeProvider>
            {/* <SidebarTrigger className='absolute left-2 bottom-2' /> */}
          </main>
        </SidebarProvider>
      </body>
    </html>
  )
}
