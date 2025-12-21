import React from 'react'
import DevicesComponent from '@/components/devices/Device'

const DevicePage = () => {
  return (
    <div className='p-5'>
      <h1 className='text-2xl font-bold'>Device</h1>
      <div className='mt-4'>
        <DevicesComponent />
      </div>
    </div>
  )
}

export default DevicePage
