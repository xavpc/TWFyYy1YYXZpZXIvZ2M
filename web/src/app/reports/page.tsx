import React from 'react'
import ReportsTable from '@/components/reports/ReportsTable'
const ReportsPage = () => {
  return (
    <div className='p-5'>
        <h1 className='text-2xl font-bold'>Reports</h1>
        <div className='mt-4'>
            <ReportsTable />
        </div>
    </div>
  )
}

export default ReportsPage
