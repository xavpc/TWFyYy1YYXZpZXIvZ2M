import React from 'react'
import { useTranslations } from 'next-intl' // Import useTranslations

const DashboardPage = () => {
  const t = useTranslations('Layout') // Ensure translations work
  const dashboard = useTranslations('Dashboard')

  return (
    <div className='p-5'>
      <h1 className='text-2xl font-bold'>{t('Dashboard')}</h1>
      <div className='mt-4'>
        <h2 className='text-lg font-bold'>{dashboard('Hello there')} </h2>
      </div>
    </div>
  )
}

export default DashboardPage
