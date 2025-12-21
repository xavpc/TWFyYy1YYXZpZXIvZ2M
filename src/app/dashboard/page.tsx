import React from 'react'
import { useTranslations } from 'next-intl' // Import useTranslations

const DashboardPage = () => {
  const t = useTranslations('Layout') // Ensure translations work
  return (
    <div className='p-5'>
      <h1 className='text-2xl font-bold'>{t('Dashboard')}</h1>
      <div className='mt-4'></div>
    </div>
  )
}

export default DashboardPage
