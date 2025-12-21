'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl' // Import useTranslations

const OSMMap = dynamic(() => import('@/components/OSM/OSMMap'), { ssr: false })

export default function MapPage() {
  const t = useTranslations('Layout') // Ensure
  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold'>{t('Route')}</h1>
      <OSMMap />
    </div>
  )
}
