import React from 'react'
import Employee from '@/components/employees/Employee'

const EmployeePage = () => {
  return (
    <div className='p-5'>
      <h1 className='text-2xl font-bold'>Employees</h1>
      <div className='mt-4'>
        <Employee />
      </div>
    </div>
  )
}

export default EmployeePage
