import React from 'react'
import { useTranslations } from 'next-intl' // Import useTranslations

import { EmployeeChart } from '@/components/dashboard/employee-chart'
import { SessionChart } from '@/components/dashboard/session-chart'
import { ChartBar } from '@/components/dashboard/collection-chart'

const DashboardPage = () => {
  const t = useTranslations('Layout') // Ensure translations work

  return (
    <div className='p-5'>
      <h1 className='text-2xl font-bold'>{t('Dashboard')}</h1>
      <div className='mt-4 grid grid-cols-3 gap-4'>
        <EmployeeChart />
        <SessionChart />
        <ChartBar />
      </div>
    </div>
  )
}

export default DashboardPage
