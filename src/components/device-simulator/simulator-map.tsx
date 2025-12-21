'use client'
import React, { JSX, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import axios from 'axios'

// Dynamically import the map component with SSR disabled
const Map = dynamic(() => import('./client-side-map'), { ssr: false })

interface Employee {
  employee_id: string
  first_name: string
  middle_name: string | null
  last_name: string
  email: string
  contact_number: string
  address: string
  age: number
  status: string
}

interface Device {
  device_id: string
  device_name: string
  vehicle_plate_num: string
  status: string
  employee: Employee
}

const DeviceSimulatorMap = (): JSX.Element => {
  const t = useTranslations('Layout')
  const devsim = useTranslations('Device Simulator')
  const [loading, setLoading] = useState(false)
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null)
  const [markers, setMarkers] = useState<Array<{ lat: number; lng: number }>>(
    []
  )
  const [routeInfo, setRouteInfo] = useState<{
    distance: number | null
    duration: number | null
  }>({ distance: null, duration: null })
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Fetch devices on component mount
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

  const handleStartSession = async () => {
    if (!selectedDevice) {
      // Show an alert or notification that a device must be selected
      alert('Please select a device first')
      return
    }

    try {
      setLoading(true)
      console.log('Start session clicked for device:', selectedDevice.device_id)

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-sessions/`
      const response = await axios.post(apiUrl, {
        device_id: selectedDevice.device_id,
      })
      console.log('Session started successfully:', response.data)

      if (response.data.success && response.data.data) {
        setSessionId(response.data.data.session_id)
        setSessionStartTime(response.data.data.start)
        setMarkers([]) // Clear any previous markers
        setRouteInfo({ distance: null, duration: null }) // Reset route info
      }
    } catch (error) {
      console.error('Error starting session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMarker = (position: { lat: number; lng: number }) => {
    setMarkers((prev) => [...prev, position])
    console.log('Added marker at:', position)
  }

  const handleRemoveMarker = (index: number) => {
    setMarkers((prev) => {
      const newMarkers = [...prev]
      newMarkers.splice(index, 1)
      return newMarkers
    })
    console.log('Removed marker at index:', index)

    // Reset route info to recalculate after marker removal
    setRouteInfo({ distance: null, duration: null })
  }

  const handleClearAllWaypoints = () => {
    if (sessionId) {
      setMarkers([])
      setRouteInfo({ distance: null, duration: null })
      console.log('Cleared all waypoints')
    }
  }

  // Fetch route information when markers change
  useEffect(() => {
    const fetchRouteInfo = async () => {
      if (markers.length >= 2) {
        try {
          let totalDistance = 0
          let totalDuration = 0

          // Calculate route info for each segment
          for (let i = 0; i < markers.length - 1; i++) {
            const startPoint = markers[i]
            const endPoint = markers[i + 1]

            // Build the URL with query parameters
            const routeUrl = `${process.env.NEXT_PUBLIC_API_URL}/osrm/route?start=${startPoint.lat},${startPoint.lng}&end=${endPoint.lat},${endPoint.lng}`

            const response = await axios.get(routeUrl)

            if (
              response.data &&
              response.data.routes &&
              response.data.routes.length > 0
            ) {
              const route = response.data.routes[0]
              totalDistance += route.distance
              totalDuration += route.duration
            }
          }

          setRouteInfo({
            distance: totalDistance,
            duration: totalDuration,
          })
          console.log('Route info updated, total distance:', totalDistance)
        } catch (error) {
          console.error('Error fetching route info:', error)
        }
      } else {
        // Reset route info when we have fewer than 2 markers
        setRouteInfo({ distance: null, duration: null })
      }
    }

    fetchRouteInfo()
  }, [markers])

  // Format the session start time for display
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString()
  }

  // Format the distance in meters to a more readable format
  const formatDistance = (meters: number | null) => {
    if (meters === null) return '-'
    return meters < 1000
      ? `${meters.toFixed(1)} m`
      : `${(meters / 1000).toFixed(2)} km`
  }

  // Format the duration in seconds to a more readable format
  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return '-'

    if (seconds < 60) {
      return `${seconds.toFixed(0)} sec`
    } else if (seconds < 3600) {
      const minutes = seconds / 60
      return `${minutes.toFixed(0)} min`
    } else {
      const hours = seconds / 3600
      return `${hours.toFixed(1)} hr`
    }
  }

  // Function to get device display name
  const getDeviceDisplayName = (device: Device) => {
    return `${device.device_name} (${device.vehicle_plate_num})`
  }

  // Function to get employee display name
  const getEmployeeDisplayName = (employee: Employee) => {
    return `${employee.first_name} ${employee.last_name}`
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Header Bar */}
      <div className='bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold text-white'>
          {t('Device Simulator')}
        </h1>

        {!sessionId ? (
          <button
            onClick={handleStartSession}
            className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2'
            disabled={loading || !selectedDevice}
          >
            {loading ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
                {devsim('Starting')}
              </>
            ) : (
              <>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                    clipRule='evenodd'
                  />
                </svg>
                {devsim('Start Session')}
              </>
            )}
          </button>
        ) : (
          <div className='text-green-400 flex items-center gap-2'>
            <span className='h-2 w-2 bg-green-400 rounded-full animate-pulse'></span>
            {devsim('Session Active')}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className='flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-gray-900 overflow-hidden'>
        {/* Left Panel - Session Info */}
        <div className='lg:col-span-1 flex flex-col max-h-[calc(100vh-8rem)]'>
          {sessionId ? (
            <div className='bg-gray-800 border border-gray-700 rounded-md shadow-md flex flex-col h-full'>
              <div className='p-4 border-b border-gray-700'>
                <h3 className='font-semibold text-green-400 text-lg'>
                  {devsim('Active Session')}
                </h3>
              </div>
              <div className='flex-1 overflow-y-auto p-4'>
                <div className='space-y-4'>
                  {/* Device Information */}
                  {selectedDevice && (
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
                            Operator
                          </p>
                          <p className='text-purple-300 text-xs'>
                            {getEmployeeDisplayName(selectedDevice.employee)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                      Session ID
                    </p>
                    <p className='font-mono bg-gray-900 px-2 py-1 rounded text-green-300 text-xs overflow-hidden overflow-ellipsis'>
                      {sessionId}
                    </p>
                  </div>

                  {sessionStartTime && (
                    <div>
                      <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                        Started
                      </p>
                      <p className='bg-gray-900 px-2 py-1 rounded text-blue-300 text-xs'>
                        {formatTime(sessionStartTime)}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                      Points
                    </p>
                    <p className='bg-gray-900 px-2 py-1 rounded text-yellow-300 text-xs'>
                      {markers.length}
                    </p>
                  </div>

                  {/* Route Information */}
                  {markers.length >= 2 && (
                    <div className='pt-3 pb-3 border-t border-b border-gray-700'>
                      <h4 className='text-sm font-semibold text-white mb-2'>
                        Route Information
                      </h4>
                      <div className='grid grid-cols-2 gap-2'>
                        <div>
                          <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                            Distance
                          </p>
                          <p className='bg-gray-900 px-2 py-1 rounded text-purple-300 text-xs'>
                            {formatDistance(routeInfo.distance)}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                            Duration
                          </p>
                          <p className='bg-gray-900 px-2 py-1 rounded text-orange-300 text-xs'>
                            {formatDuration(routeInfo.duration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className='pt-3'>
                    <h4 className='text-sm font-semibold text-white mb-2'>
                      Instructions
                    </h4>
                    <ul className='text-sm text-gray-400 space-y-2'>
                      <li className='flex items-start gap-2'>
                        <div className='mt-1 h-2 w-2 rounded-full bg-green-500 flex-shrink-0'></div>
                        <span>Click on map to add starting point</span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <div className='mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0'></div>
                        <span>Continue adding waypoints as needed</span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <div className='mt-1 h-2 w-2 rounded-full bg-red-500 flex-shrink-0'></div>
                        <span>Last point marks the destination</span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <div className='mt-1 h-2 w-2 rounded-full bg-yellow-500 flex-shrink-0'></div>
                        <span>Click a marker and use popup to remove it</span>
                      </li>
                    </ul>
                  </div>

                  {/* Clear All Waypoints Button */}
                  {markers.length > 0 && (
                    <button
                      onClick={handleClearAllWaypoints}
                      className='w-full mt-2 bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded-md transition-colors text-sm flex items-center justify-center gap-2'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                        />
                      </svg>
                      Clear All Waypoints
                    </button>
                  )}

                  {/* Marker Coordinates List */}
                  {markers.length > 0 && (
                    <div className='pt-3 border-t border-gray-700'>
                      <h4 className='text-sm font-semibold text-white mb-2'>
                        Waypoints
                      </h4>
                      <div className='max-h-48 overflow-y-auto pr-2'>
                        {markers.map((marker, index) => (
                          <div
                            key={`coord-${index}`}
                            className='text-xs mb-2 p-2 rounded bg-gray-900 flex items-center justify-between'
                          >
                            <div className='flex items-center'>
                              <div
                                className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${
                                  index === 0
                                    ? 'bg-green-500'
                                    : index === markers.length - 1
                                    ? 'bg-red-500'
                                    : 'bg-blue-500'
                                }`}
                              ></div>
                              <div>
                                <span className='text-gray-400 mr-1'>
                                  {index === 0
                                    ? 'Start:'
                                    : index === markers.length - 1
                                    ? 'End:'
                                    : `Point ${index}:`}
                                </span>
                                <span className='font-mono'>
                                  {marker.lat.toFixed(6)},{' '}
                                  {marker.lng.toFixed(6)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveMarker(index)}
                              className='text-red-400 hover:text-red-300 p-1'
                              title='Remove waypoint'
                            >
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className='h-4 w-4'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M6 18L18 6M6 6l12 12'
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className='bg-gray-800 border border-gray-700 rounded-md shadow-md flex flex-col h-full'>
              <div className='p-4 border-b border-gray-700'>
                <h3 className='font-semibold text-blue-400 text-lg'>
                  {devsim('Select a Device')}
                </h3>
              </div>
              <div className='flex-1 overflow-y-auto p-4'>
                {/* Device Selection Dropdown */}
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
                        ) : devices.length === 0 ? (
                          <div className='px-3 py-2 text-sm text-gray-400'>
                            No devices available
                          </div>
                        ) : (
                          devices.map((device) => (
                            <button
                              key={device.device_id}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 ${
                                selectedDevice?.device_id === device.device_id
                                  ? 'bg-gray-800 text-blue-400'
                                  : 'text-white'
                              }`}
                              onClick={() => {
                                setSelectedDevice(device)
                                setIsDropdownOpen(false)
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

                <div className='flex flex-col items-center justify-center text-center pt-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-16 w-16 text-gray-600 mb-4'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1}
                      d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
                    />
                  </svg>
                  <h3 className='text-lg text-gray-300 font-medium'>
                    {devsim('Device Simulator')}
                  </h3>
                  <p className='text-gray-500 mt-2 text-sm'>
                    Select a device and start a session to create a route
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Map */}
        <div className='lg:col-span-3 h-[600px] bg-gray-800 border border-gray-700 rounded-md shadow-md overflow-hidden'>
          <Map
            sessionActive={!!sessionId}
            onAddMarker={handleAddMarker}
            onRemoveMarker={handleRemoveMarker}
            markers={markers}
            onClearMarkers={handleClearAllWaypoints}
          />
        </div>
      </div>
    </div>
  )
}

export default DeviceSimulatorMap
