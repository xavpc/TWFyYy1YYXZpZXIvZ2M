import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'

import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { FloatingTrigger } from '@/components/floating-trigger'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head />
      <body>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          disableTransitionOnChange
        >
          <SidebarProvider>
            <NextIntlClientProvider messages={messages}>
              {/* Show Sidebar unless on the Login Page */}
              <AppSidebar />
              <SidebarInset>
                <main className='relative w-full '>{children}</main>
                <FloatingTrigger />
              </SidebarInset>
            </NextIntlClientProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
