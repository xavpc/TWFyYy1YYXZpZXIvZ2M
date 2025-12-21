'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export default function LanguageSwitcher() {
  const currentLocale = useLocale()
  const [locale, setLocale] = useState(currentLocale)

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale') || 'en'
    setLocale(storedLocale)
  }, [])

  // Client-side function to update and save the locale
  const changeLocale = (newLocale: string) => {
    if (typeof window !== 'undefined') {
        // Save locale to localStorage
        localStorage.setItem('locale', newLocale)
        // Also set a cookie so the server can read it
        document.cookie = `locale=${newLocale}; path=/;`
      
      // Refresh the page so that your app re-initializes with the new locale
      window.location.reload()
    }
  }

  const changeLanguage = (newLocale: string) => {
    if (newLocale !== locale) {
      setLocale(newLocale)
      changeLocale(newLocale)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>
          {locale === 'en' ? '🇺🇸 English' : locale === 'jp' ? '🇯🇵 日本語' : 'no locale'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('jp')}>
          🇯🇵 日本語
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
