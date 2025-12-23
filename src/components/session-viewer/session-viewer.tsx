'use client'
import React, { JSX, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { Device } from '@/types/device'
import axios from 'axios'
import DeviceCombobox from './subcomponents/device-combobox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Define a type for the session data
interface DeviceSession {
  session_id: string;
  start: string;
  end: string;
  device_locations?: any[]; // Optional if you want to use this later
}
interface GroupedSessions {
  [monthYear: string]: {
    [weekNum: string]: DeviceSession[];
  };
}


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
  
  // New state for sessions
  const [deviceSessions, setDeviceSessions] = useState<DeviceSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [selectedSession, setSelectedSession] = useState<DeviceSession | null>(null)
  const [sessionDetailModalOpen, setSessionDetailModalOpen] = useState(false);

  // State for device info modal
  const [deviceInfoModalOpen, setDeviceInfoModalOpen] = useState(false)

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

  // New function to fetch sessions when a device is selected
  const fetchDeviceSessions = async (deviceId: string) => {
    try {
      setSessionsLoading(true)
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-sessions/device/${deviceId}`
      const response = await axios.get(apiUrl)

      if (response.data.success && response.data.data) {
        setDeviceSessions(response.data.data)
        setSelectedSession(null) // Reset selected session
      } else {
        setDeviceSessions([])
      }
    } catch (error) {
      console.error('Error fetching device sessions:', error)
      setDeviceSessions([])
    } finally {
      setSessionsLoading(false)
    }
  }

  const handleDeviceSelect = (device: Device | null) => {
    setSelectedDevice(device)
    setSelectedSession(null) // Reset selected session when device changes
    
    if (device) {
      fetchDeviceSessions(device.device_id)
    } else {
      setDeviceSessions([])
    }
  }
  
  const handleSessionSelect = (session: DeviceSession) => {
    setSelectedSession(session)
    setViewingSession(true)
  }
  
  const getDeviceDisplayName = (device: Device) => {
    return `${device.device_name} (${device.vehicle_plate_num})`
  }

  const getEmployeeDisplayName = (employee: Device['employee']) => {
    return `${employee.first_name} ${employee.last_name}`
  }
  
  // Function to format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }
  

  const organizeSessionsByMonthAndWeek = (sessions: DeviceSession[]): GroupedSessions => {
    // Sort sessions by start date (newest first)
    const sortedSessions = [...sessions].sort((a, b) => {
      return new Date(b.start).getTime() - new Date(a.start).getTime();
    });
    
    const grouped: GroupedSessions = {};
    
    sortedSessions.forEach(session => {
      const date = new Date(session.start);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const weekNum = getWeekOfMonth(date).toString();
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = {};
      }
      
      if (!grouped[monthYear][weekNum]) {
        grouped[monthYear][weekNum] = [];
      }
      
      grouped[monthYear][weekNum].push(session);
    });
    
    return grouped;
  }

  // Helper to get week of month
  const getWeekOfMonth = (date: Date): number => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return Math.ceil((date.getDate() + firstDay) / 7);
  }

  const openSessionDetail = (session: DeviceSession) => {
    setSelectedSession(session);
    setSessionDetailModalOpen(true);
  }


  return (
    <div className='flex flex-col h-[calc(100vh-64px)]'>
      {/* Header Bar */}
      <div className='bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold text-white'>
          {t('Session Viewer')}
        </h1>
        <div className="flex space-x-3">
          {selectedDevice && (
            <button
              onClick={() => setDeviceInfoModalOpen(true)}
              className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors'
            >
              Device Info
            </button>
          )}
          <button
            onClick={() => setViewingSession(!viewingSession)}
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors'
            disabled={!selectedSession}
          >
            {viewingSession ? 'Close Session' : 'View Session'}
          </button>
        </div>
      </div>
  
      {/* Main Content */}
      <div className='flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-gray-900 overflow-hidden'>
        {/* Left Panel */}
        <div className='lg:col-span-1 bg-gray-800 border border-gray-700 rounded-md shadow-md flex flex-col overflow-hidden'>
          <div className='p-4 border-b border-gray-700'>
            <h3 className='font-semibold text-blue-400 text-lg'>
              {devsim('Session Information')}
            </h3>
          </div>
          
          {/* Device Selection */}
          <div className='p-4'>
            <DeviceCombobox 
              devices={devices} 
              devicesLoading={devicesLoading}
              onSelectDevice={handleDeviceSelect}
              selectedDevice={selectedDevice}
            />
          </div>
          
          {/* Sessions List - Now the main focus of the left panel */}
<div className='px-4 pb-4 flex-1 overflow-y-auto'>
  {selectedDevice && (
    <div className='space-y-4'>
      {/* Header with session count moved outside */}
      <div className="flex justify-between items-center">
        <h4 className='text-white text-sm font-medium'>
          Available Sessions
        </h4>
        <span className='text-xs text-gray-500'>
          {deviceSessions.length} session{deviceSessions.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {/* Today's sessions section */}
      <div className='bg-gray-900 rounded-md p-3 border border-gray-700'>
        <h5 className="text-xs font-medium text-blue-400 mb-2">Today's Sessions</h5>
        {sessionsLoading ? (
          <div className='flex items-center justify-center py-4'>
            <svg className='animate-spin h-5 w-5 text-blue-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
            </svg>
          </div>
        ) : (
          <>
            {deviceSessions.filter(session => {
              const sessionDate = new Date(session.start).toLocaleDateString();
              const today = new Date().toLocaleDateString();
              return sessionDate === today;
            }).length > 0 ? (
              <div className='space-y-2'>
                {deviceSessions.filter(session => {
                  const sessionDate = new Date(session.start).toLocaleDateString();
                  const today = new Date().toLocaleDateString();
                  return sessionDate === today;
                }).map((session) => (
                  <div key={session.session_id} className="group mb-1">
                    <button
                      onClick={() => handleSessionSelect(session)}
                      className={`w-full block text-left p-3 rounded-t-md border-t border-l border-r transition-colors ${
                        selectedSession?.session_id === session.session_id
                          ? 'bg-blue-900/30 border-blue-500'
                          : 'border-gray-700 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-blue-400">
                          {new Date(session.start).toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(session.start).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(session.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          {' - '}
                          {new Date(session.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </button>
                    <button 
                      onClick={() => openSessionDetail(session)}
                      className={`w-full text-center py-1 text-xs rounded-b-md border-b border-l border-r transition-colors ${
                        selectedSession?.session_id === session.session_id 
                          ? 'bg-blue-900/20 border-blue-500 text-blue-400'
                          : 'border-gray-700 bg-gray-900/30 text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <p className='text-gray-400 text-sm'>No sessions today</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Session filtering */}
      <div className='bg-gray-900 rounded-md p-3 border border-gray-700'>
        <h5 className="text-xs font-medium text-blue-400 mb-2">Filter Sessions</h5>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Date</label>
            <div className="flex">
              <input 
                type="date" 
                className="rounded bg-gray-800 border border-gray-700 text-gray-200 text-xs p-1 w-full"
                onChange={(e) => {
                  // TODO: add afiletering here
                }}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Session Duration</label>
            <select 
              className="w-full rounded bg-gray-800 border border-gray-700 text-gray-200 text-xs p-1"
              onChange={(e) => {
                // TODO: add filterin g here
              }}
            >
              <option value="all">All Sessions</option>
              <option value="short">Short (&lt; 1 hour)</option>
              <option value="medium">Medium (1-3 hours)</option>
              <option value="long">Long (&gt; 3 hours)</option>
            </select>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors mt-1">
            Apply Filters
          </button>
        </div>
      </div>
      
      {/* All available sessions */}
      <div className='bg-gray-900 rounded-md p-3 border border-gray-700'>
        <h5 className="text-xs font-medium text-blue-400 mb-2">All Sessions</h5>
        {sessionsLoading ? (
          <div className='flex items-center justify-center py-8'>
            <svg className='animate-spin h-6 w-6 text-blue-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
            </svg>
          </div>
        ) : deviceSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="h-10 w-10 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className='text-gray-400 text-sm'>No sessions found for this device</p>
          </div>
        ) : (
          <div className='space-y-4 max-h-80 overflow-y-auto pr-1 custom-scrollbar'>
            {Object.entries(organizeSessionsByMonthAndWeek(deviceSessions)).map(([monthYear, weeks]) => (
              <div key={monthYear} className="space-y-2">
                <h5 className="text-sm font-medium text-gray-300 px-1 sticky top-0 bg-gray-900 py-1 z-10">{monthYear}</h5>
                
                {Object.entries(weeks)
                  // Sort weeks in descending order (newest first)
                  .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                  .map(([weekNum, sessions]) => (
                    <div key={`${monthYear}-${weekNum}`} className="space-y-1 mb-3">
                      <h6 className="text-xs text-gray-500 px-1">Week {weekNum}</h6>
                      
                      {sessions.map((session) => (
                        <div key={session.session_id} className="group mb-1">
                          <button
                            onClick={() => handleSessionSelect(session)}
                            className={`w-full block text-left p-3 rounded-t-md border-t border-l border-r transition-colors ${
                              selectedSession?.session_id === session.session_id
                                ? 'bg-blue-900/30 border-blue-500'
                                : 'border-gray-700 hover:bg-gray-800'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-blue-400">
                                {new Date(session.start).toLocaleDateString('en-US', { weekday: 'long' })}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(session.start).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(session.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                {' - '}
                                {new Date(session.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </button>
                          <button 
                            onClick={() => openSessionDetail(session)}
                            className={`w-full text-center py-1 text-xs rounded-b-md border-b border-l border-r transition-colors ${
                              selectedSession?.session_id === session.session_id 
                                ? 'bg-blue-900/20 border-blue-500 text-blue-400'
                                : 'border-gray-700 bg-gray-900/30 text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            View Details
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )}
</div>
        </div>
  
        {/* Map Panel */}
        <div className='lg:col-span-3 bg-gray-800 border border-gray-700 rounded-md shadow-md overflow-hidden' style={{ height: '100%' }}>
          <Map />
        </div>
      </div>
      
      {/* Device Information Modal */}
      <Dialog open={deviceInfoModalOpen} onOpenChange={setDeviceInfoModalOpen}>
        <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-md" style={{ position: 'fixed', zIndex: 9999 }}>
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-400">
              Device Information
            </DialogTitle>
          </DialogHeader>
          
          {selectedDevice && (
            <div className="space-y-4">
              {/* Device Info Section */}
              <div className="space-y-3 pb-3 border-b border-gray-700">
                <h4 className="text-sm font-medium text-gray-300">Device Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Name</p>
                    <p className="text-sm text-blue-300">{selectedDevice.device_name}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Status</p>
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
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Device ID</p>
                    <p className="text-sm text-blue-300 font-mono">{selectedDevice.device_id}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Vehicle Plate</p>
                    <p className="text-sm text-blue-300">{selectedDevice.vehicle_plate_num}</p>
                  </div>
                </div>
              </div>
              
              {/* Employee Info Section */}
              {selectedDevice.employee && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-300">Assigned Employee</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Name</p>
                      <p className="text-sm text-purple-300">{getEmployeeDisplayName(selectedDevice.employee)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</p>
                      <p className="text-sm text-purple-300">{selectedDevice.employee.email}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Contact</p>
                      <p className="text-sm text-purple-300">{selectedDevice.employee.contact_number}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Address</p>
                      <p className="text-sm text-purple-300">{selectedDevice.employee.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
  
      {/* Session Detail Modal */}
      <Dialog open={sessionDetailModalOpen} onOpenChange={setSessionDetailModalOpen}>
        <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-md" style={{ position: 'fixed', zIndex: 9999 }}>
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-400">
              Session Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="space-y-3 pb-3 border-b border-gray-700">
                <h4 className="text-sm font-medium text-gray-300">Time Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Day</p>
                    <p className="text-sm text-blue-300">{new Date(selectedSession.start).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Date</p>
                    <p className="text-sm text-blue-300">{new Date(selectedSession.start).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Start Time</p>
                    <p className="text-sm text-blue-300">{new Date(selectedSession.start).toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">End Time</p>
                    <p className="text-sm text-blue-300">{new Date(selectedSession.end).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Session Information</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Session ID</p>
                    <p className="text-sm text-purple-300 font-mono">{selectedSession.session_id}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Duration</p>
                    <p className="text-sm text-purple-300">
                      {(() => {
                        const start = new Date(selectedSession.start);
                        const end = new Date(selectedSession.end);
                        const diffMs = end.getTime() - start.getTime();
                        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        return `${diffHrs} hr${diffHrs !== 1 ? 's' : ''} ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SessionViewer