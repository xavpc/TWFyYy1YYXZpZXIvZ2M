import React from 'react'
import { useTranslations } from 'next-intl'
import LiveSimulatorMap from '@/components/device-simulator/live/live-simulator-map'

const DashboardPage = () => {
  const t = useTranslations('Layout')
  const devsim = useTranslations('Device Simulator')

  return (
    <div className='p-5'>
        <LiveSimulatorMap/>

    </div>
  )
}

export default DashboardPage
