'use client'
import React, { useState, useEffect } from 'react'
import { Device } from '@/types/device'

interface DeviceComboboxProps {
  devices: Device[]
  devicesLoading: boolean
  onSelectDevice: (device: Device | null) => void
  selectedDevice: Device | null
}

const DeviceCombobox: React.FC<DeviceComboboxProps> = ({
  devices,
  devicesLoading,
  onSelectDevice,
  selectedDevice
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [deviceSearchQuery, setDeviceSearchQuery] = useState('')
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([])

  // Filter devices based on search query
  useEffect(() => {
    if (devices && devices.length > 0) {
      setFilteredDevices(
        devices.filter(device => 
          device.device_name.toLowerCase().includes(deviceSearchQuery.toLowerCase()) ||
          device.vehicle_plate_num.toLowerCase().includes(deviceSearchQuery.toLowerCase())
        )
      )
    } else {
      setFilteredDevices([])
    }
  }, [devices, deviceSearchQuery])

  // Helper function to display device name with vehicle plate
  const getDeviceDisplayName = (device: Device) => {
    return `${device.device_name} (${device.vehicle_plate_num})`
  }

  // Helper function to display employee name
  const getEmployeeDisplayName = (employee: Device['employee']) => {
    return `${employee.first_name} ${employee.last_name}`
  }

  return (
    <div className='mb-6'>
      <label className='block text-sm font-medium text-gray-400 mb-2'>
        Device
      </label>
      <div className='relative'>
        <button
          type='button'
          className='relative w-full bg-gray-900 border border-gray-700 rounded-md pl-3 pr-10 py-2 text-left cursor-default text-white'
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className='block truncate'>
            {selectedDevice
              ? getDeviceDisplayName(selectedDevice)
              : 'Select a device...'}
          </span>
          <span className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
            <svg
              className='h-5 w-5 text-gray-400'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
              aria-hidden='true'
            >
              <path
                fillRule='evenodd'
                d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </span>
        </button>

        {/* Dropdown Panel */}
        {isDropdownOpen && (
          <div className='absolute z-10 mt-1 w-full bg-gray-900 shadow-lg rounded-md py-1 max-h-60 overflow-auto'>
            {/* Search input */}
            <div className="px-3 py-2 sticky top-0 bg-gray-900 border-b border-gray-700 z-10">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search devices..."
                  value={deviceSearchQuery}
                  onChange={(e) => setDeviceSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {devicesLoading ? (
              <div className='px-3 py-2 text-sm text-gray-400 flex items-center justify-center'>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Loading devices...
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className='px-3 py-2 text-sm text-gray-400'>
                No devices found
              </div>
            ) : (
              filteredDevices.map((device) => (
                <button
                  key={device.device_id}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 ${
                    selectedDevice?.device_id === device.device_id
                      ? 'bg-gray-800 text-blue-400'
                      : 'text-white'
                  }`}
                  onClick={() => {
                    onSelectDevice(device)
                    setIsDropdownOpen(false)
                    setDeviceSearchQuery('') // Reset search query
                  }}
                >
                  <div className='flex flex-col'>
                    <span className='font-medium'>
                      {getDeviceDisplayName(device)}
                    </span>
                    <span className='text-xs text-gray-400'>
                      Operator:{' '}
                      {getEmployeeDisplayName(device.employee)}
                    </span>
                    <span
                      className={`text-xs mt-1 inline-flex items-center ${
                        device.status === 'active'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full mr-1 ${
                          device.status === 'active'
                            ? 'bg-green-400'
                            : 'bg-red-400'
                        }`}
                      ></span>
                      {device.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeviceCombobox