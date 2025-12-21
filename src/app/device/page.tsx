import React from 'react'
import Devices from '@/components/devices/Device'

const DevicePage = () => {
  return (
    <div>
      <h1 className='text-2xl font-bold'>Device</h1>
      <div className='mt-4'>
        <Devices />
      </div>
    </div>
  )
}

export default DevicePage
