'use client'
import React, { JSX } from 'react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import axios from 'axios'
// Dynamically import the map component with SSR disabled
const Map = dynamic(
  () => import('./client-side-map'),
  { ssr: false }
)

const DeviceSimulatorMap = (): JSX.Element => {
  const t = useTranslations('Layout')
  const devsim = useTranslations('Device Simulator')
  
  const handleStartSession = () => {

    console.log('Start session clicked')  
  }
  
  return (
    <div className='p-5'>
      <h1 className='text-2xl font-bold mb-4'>{t('Device Simulator')}</h1>
      <div className='mt-4'>
        <h2 className='text-lg font-bold mb-2'>{devsim('Hello there')}</h2>
        
        {/* Add the button above the map */}
        <div className='mb-4'>
          <button 
            onClick={handleStartSession}
            className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors'
          >
            {devsim('Start Session')}
          </button>
        </div>
        
        <Map />
      </div>
    </div>
  )
}

export default DeviceSimulatorMap