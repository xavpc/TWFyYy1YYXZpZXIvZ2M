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

const SessionViewer = (): JSX.Element => {
  const t = useTranslations('Layout')
  const devsim = useTranslations('Session Viewer')
  
  const handleStartSession = () => {

    console.log('Start session clicked')  
  }
  
  return (
    <div className='p-5'>
      <h1 className='text-2xl font-bold mb-4'>{t('Session Viewer')}</h1>
      <div className='mt-4'>
        

        
        <Map />
      </div>
    </div>
  )
}

export default SessionViewer