'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export default function LanguageSwitcher() {
  const router = useRouter()
  const currentLocale = useLocale()
  const [locale, setLocale] = useState(currentLocale)

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale') || 'en'
    setLocale(storedLocale)
  }, [])

  const changeLanguage = (newLocale: string) => {
    if (newLocale !== locale) {
      localStorage.setItem('locale', newLocale)
      setLocale(newLocale)
      router.refresh() // Reload the page to apply the new language
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>
          {locale === 'en' ? '🇺🇸 English' : '🇯🇵 日本語'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('ja')}>
          🇯🇵 日本語
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
