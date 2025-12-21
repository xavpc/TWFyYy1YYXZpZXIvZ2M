import Route from '@/components/route/Route'
import React from 'react'
import { useTranslations } from 'next-intl' // Import useTranslations

const RoutePage = () => {
  const t = useTranslations('Layout') // Ensure
  return (
    <div className='p-5'>
      <h1 className='text-2xl font-bold'>{t('Route')}</h1>
      <Route />
    </div>
  )
}

export default RoutePage
