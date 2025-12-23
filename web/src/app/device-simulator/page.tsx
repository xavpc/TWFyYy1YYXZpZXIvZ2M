import React from 'react'
import { useTranslations } from 'next-intl'
import DeviceSimulatorMap from '@/components/device-simulator/simulator-map'
const DashboardPage = () => {
  const t = useTranslations('Layout')
  const devsim = useTranslations('Device Simulator')

  return (
    <div className='p-5'>
        <DeviceSimulatorMap/>

    </div>
  )
}

export default DashboardPage
