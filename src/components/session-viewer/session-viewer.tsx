'use client'
import React, { JSX, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { Device } from '@/types/device'
import axios from 'axios'
import DeviceCombobox from './subcomponents/device-combobox'

// Dynamically import the map component with SSR disabled
const Map = dynamic(
  () => import('./client-side-map'),
  { ssr: false }
)

const SessionViewer = (): JSX.Element => {
  const t = useTranslations('Layout')
  const devsim = useTranslations('Session Viewer')
  const [devices, setDevices] = useState<Device[]>([])
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [viewingSession, setViewingSession] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setDevicesLoading(true)
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/devices/`
        const response = await axios.get(apiUrl)

        if (response.data.success && response.data.data) {
          setDevices(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching devices:', error)
      } finally {
        setDevicesLoading(false)
      }
    }

    fetchDevices()
  }, [])

  const handleDeviceSelect = (device: Device | null) => {
    setSelectedDevice(device)
    console.log('Selected device:', device)
  }
  
  const getDeviceDisplayName = (device: Device) => {
    return `${device.device_name} (${device.vehicle_plate_num})`
  }

  const getEmployeeDisplayName = (employee: Device['employee']) => {
    return `${employee.first_name} ${employee.last_name}`
  }
  
  return (
    <div className='flex flex-col h-[calc(100vh-64px)]'>
      {/* Header Bar */}
      <div className='bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold text-white'>
          {t('Session Viewer')}
        </h1>
        <button
          onClick={() => setViewingSession(!viewingSession)}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors'
        >
          {viewingSession ? 'Close Session' : 'View Session'}
        </button>
      </div>

      {/* Main Content */}
      <div className='flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-gray-900 overflow-auto' style={{ height: 'calc(100vh - 132px)' }}>
        {/* Left Panel */}
        <div className='lg:col-span-1 flex flex-col overflow-auto'>
          <div className='bg-gray-800 border border-gray-700 rounded-md shadow-md flex flex-col h-full'>
            <div className='p-4 border-b border-gray-700'>
              <h3 className='font-semibold text-blue-400 text-lg'>
                {devsim('Session Information')}
              </h3>
            </div>
            
            {/* Device Selection using matching UI style */}
            <div className='p-4'>
              <DeviceCombobox 
                devices={devices} 
                devicesLoading={devicesLoading}
                onSelectDevice={handleDeviceSelect}
                selectedDevice={selectedDevice}
              />
            </div>
            
            {/* Device Information - With Your Preferred Theme */}
            {selectedDevice && (
              <div className='px-4 pb-4'>
                <div className='mb-4 bg-gray-900 rounded-md p-3 border border-gray-700'>
                  <h4 className='text-white text-sm font-medium mb-2'>
                    Device Information
                  </h4>
                  <div className='space-y-2'>
                    <div>
                      <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                        Device
                      </p>
                      <p className='text-blue-300 text-xs'>
                        {getDeviceDisplayName(selectedDevice)}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                        Device ID
                      </p>
                      <p className='text-blue-300 text-xs'>
                        {selectedDevice.device_id}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                        Status
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedDevice.status === 'active'
                            ? 'bg-green-900 text-green-300'
                            : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {selectedDevice.status}
                      </span>
                    </div>
                    <div>
                      <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                        Vehicle Plate
                      </p>
                      <p className='text-blue-300 text-xs'>
                        {selectedDevice.vehicle_plate_num}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Employee Information - With Your Preferred Theme */}
                {selectedDevice.employee && (
                  <div className='mb-4 bg-gray-900 rounded-md p-3 border border-gray-700'>
                    <h4 className='text-white text-sm font-medium mb-2'>
                      Assigned Employee
                    </h4>
                    <div className='space-y-2'>
                      <div>
                        <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                          Name
                        </p>
                        <p className='text-purple-300 text-xs'>
                          {getEmployeeDisplayName(selectedDevice.employee)}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                          Email
                        </p>
                        <p className='text-purple-300 text-xs'>
                          {selectedDevice.employee.email}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                          Contact
                        </p>
                        <p className='text-purple-300 text-xs'>
                          {selectedDevice.employee.contact_number}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                          Address
                        </p>
                        <p className='text-purple-300 text-xs'>
                          {selectedDevice.employee.address}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Map Panel */}
        <div className='lg:col-span-3 bg-gray-800 border border-gray-700 rounded-md shadow-md overflow-hidden' style={{ height: '100%' }}>
          <Map />
        </div>
      </div>
    </div>
  )
}

export default SessionViewer