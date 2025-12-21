import React from 'react'
import Complaints from '@/components/complaints/Complaints'

const ComplaintsPage = () => {
  return (
    <div className='p-5'>
      <h1 className='text-2xl font-bold'>Complaints</h1>
      <div className='mt-4'>
        <Complaints />
      </div>
    </div>
  )
}

export default ComplaintsPage
