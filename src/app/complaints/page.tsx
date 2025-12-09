import React from 'react'
import Employee from '@/components/employees/Employee'

const ComplaintsPage = () => {
  return (
    <div>
      <h1 className='text-2xl font-bold'>Complaints</h1>
      <div className='mt-4'>
        <Employee />
      </div>
    </div>
  )
}

export default ComplaintsPage
