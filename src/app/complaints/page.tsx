import React from 'react'
import Complaints from '@/components/complaints/Complaints'
import { useTranslations } from 'next-intl' // Import useTranslations

const ComplaintsPage = () => {
  const t = useTranslations('Layout') // Ensure translations work
  return (
    <div className='p-5'>
      <h1 className='text-2xl font-bold'>{t('Complaints')}</h1>
      <div className='mt-4'>
        <Complaints />
      </div>
    </div>
  )
}

export default ComplaintsPage
