import React from 'react'
import DevicesComponent from '@/components/devices/Device'
import { useTranslations } from 'next-intl' // Import useTranslations

const DevicePage = () => {
  const t = useTranslations('Layout') // Ensure translations work
  return (
    <div className='p-5'>
      <h1 className='text-2xl font-bold'>{t('Device')}</h1>
      <div className='mt-4'>
        <DevicesComponent />
      </div>
    </div>
  )
}

export default DevicePage
