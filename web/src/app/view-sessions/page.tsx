import React from 'react'
import { useTranslations } from 'next-intl'
import DeviceSimulatorMap from '@/components/device-simulator/simulator-map'
import SessionViewer from '@/components/session-viewer/session-viewer'
const DashboardPage = () => {
  const t = useTranslations('Layout')
  const devsim = useTranslations('Device Simulator')

  return (
    <div className='p-5'>
        <SessionViewer isLive={false}/>

    </div>
  )
}

export default DashboardPage
