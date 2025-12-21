import React from 'react'
import Employee from '@/components/employees/Employee'
import { useTranslations } from 'next-intl' // Import useTranslations

const EmployeePage = () => {
  const t = useTranslations('Layout') // Ensure

  return (
    <div className='p-5'>
      <h1 className='text-2xl font-bold'>{t('Employees')}</h1>
      <div className='mt-4'>
        <Employee />
      </div>
    </div>
  )
}

export default EmployeePage
